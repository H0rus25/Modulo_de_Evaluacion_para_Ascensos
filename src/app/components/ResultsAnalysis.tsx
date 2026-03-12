import { useState, useEffect } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Download,
  ChevronDown,
  Target,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';
import { getData } from '../services/n8nClient';

const N8N_RESULTS_URL = 'http://localhost:3000/api/reportes'; // Reemplazado por backend local

interface N8nReporte {
  id: string; // Reporte id (uuid)
  evaluado_id: string;
  puntuaciones: any; // JSON puede ser {"producción": [4, "obs"]} o {"produccion": 4}
  fecha_creacion: string;
  // Campos del JOIN con Trabajadores (esperados desde n8n)
  nombre_evaluado?: string;
  puesto_evaluado?: string;
  evaluador?: string;
  ascenso?: string; // Rol superior esperado
  // Campos del JOIN con Reseñas
  respuesta_bot?: string;
  analisis_bot?: string;
}

interface EvaluationData {
  id: string;
  evaluado_id: string;
  candidateName: string;
  currentPosition: string;
  targetPosition: string;
  department: string;
  evaluationDate: string;
  evaluator: string;
  botResponse?: string;
  botAnalysis?: string;
  competencies: {
    produccion: number;
    iniciativa: number;
    comunicacion: number;
    relaciones: number;
    cambio: number;
  };
  observations: {
    produccion: string;
    iniciativa: string;
    comunicacion: string;
    relaciones: string;
    cambio: string;
  };
}

// Datos de ejemplo para demostración
const mockEvaluations: EvaluationData[] = [
  {
    id: '1',
    candidateName: 'Ana María González',
    currentPosition: 'Consultor Jr.',
    targetPosition: 'Consultor Senior',
    department: 'Finanzas Corporativas',
    evaluationDate: '2026-02-15',
    evaluator: 'Carlos Mendoza',
    competencies: {
      produccion: 4,
      iniciativa: 5,
      comunicacion: 4,
      relaciones: 5,
      cambio: 4
    },
    observations: {
      produccion: 'Excelente rendimiento en proyectos de alta complejidad.',
      iniciativa: 'Proactiva y con gran capacidad de liderazgo.',
      comunicacion: 'Comunicación clara y efectiva con todos los niveles.',
      relaciones: 'Excelente trabajo en equipo y manejo de conflictos.',
      cambio: 'Adaptabilidad sobresaliente ante nuevos desafíos.'
    }
  },
  {
    id: '2',
    candidateName: 'Roberto Sánchez',
    currentPosition: 'Analista Senior',
    targetPosition: 'Gerente de Proyectos',
    department: 'Operaciones',
    evaluationDate: '2026-02-10',
    evaluator: 'María Torres',
    competencies: {
      produccion: 3,
      iniciativa: 4,
      comunicacion: 3,
      relaciones: 4,
      cambio: 3
    },
    observations: {
      produccion: 'Buen desempeño, aunque requiere mejorar en tiempos de entrega.',
      iniciativa: 'Demuestra alta proactividad en la identificación de oportunidades.',
      comunicacion: 'Necesita desarrollar habilidades de presentación ejecutiva.',
      relaciones: 'Excelente capacidad de persuasión.',
      cambio: 'Requiere mayor flexibilidad ante cambios organizacionales.'
    }
  },
  {
    id: '3',
    candidateName: 'Laura Martínez',
    currentPosition: 'Gerente de Proyectos',
    targetPosition: 'Director de Operaciones',
    department: 'Operaciones',
    evaluationDate: '2026-02-08',
    evaluator: 'Jorge Ramírez',
    competencies: {
      produccion: 5,
      iniciativa: 4,
      comunicacion: 5,
      relaciones: 4,
      cambio: 5
    },
    observations: {
      produccion: 'Resultados sobresalientes y consistentes.',
      iniciativa: 'Propone mejoras continuas y lidera innovación.',
      comunicacion: 'Comunicación estratégica excepcional.',
      relaciones: 'Gran capacidad de influencia y networking.',
      cambio: 'Líder natural en procesos de transformación.'
    }
  }
];

export function ResultsAnalysis() {
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationData | null>(null);
  const [viewMode, setViewMode] = useState<'individual' | 'comparison'>('individual');
  const [selectedTargetPosition, setSelectedTargetPosition] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotedEmployeeName, setPromotedEmployeeName] = useState('');
  const [selectedForPromotion, setSelectedForPromotion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePromote = async (evaluation: EvaluationData) => {
    try {
      setIsPromoting(true);
      
      const token = localStorage.getItem('token') || '';
      
      const response = await fetch(`http://localhost:3000/api/trabajadores/${evaluation.evaluado_id}/ascender`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ puesto: evaluation.targetPosition })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el puesto en el backend');
      }

      setPromotedEmployeeName(evaluation.candidateName);
      setShowPromotionModal(true);
      
      // Actualizamos el estado localmente para reflejar el cambio inmediato 
      setEvaluations(prev => prev.map(e => e.id === evaluation.id ? {...e, currentPosition: e.targetPosition} : e));
      if (selectedEvaluation?.id === evaluation.id) {
        setSelectedEvaluation({...evaluation, currentPosition: evaluation.targetPosition});
      }
      
    } catch (err) {
      console.error(err);
      alert('Hubo un error al aplicar el ascenso en la base de datos.');
    } finally {
      setIsPromoting(false);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getData<N8nReporte[] | null>(N8N_RESULTS_URL);
        
        if (data && data.length > 0) {
          // Mapear la estructura de la base de datos (Reportes + Trabajadores) al frontend
          // Soporta ambos formatos (arr[nota, obs] o numero plano)
          // Agrupa por empleado para promediar puntuaciones si hay múltiples reportes
          const groupedEvaluations = new Map<string, typeof data[0][]>();
          
          data.forEach(report => {
            const employeeId = report.evaluado_id;
            if (!groupedEvaluations.has(employeeId)) {
              groupedEvaluations.set(employeeId, []);
            }
            groupedEvaluations.get(employeeId)!.push(report);
          });

          const mappedEvaluations: EvaluationData[] = Array.from(groupedEvaluations.entries()).map(([employeeId, reports]) => {
            // Usa el reporte más reciente para datos base (nombre, puesto, IA)
            // Asumimos que los reportes vienen ordenados por fecha en DESC (como hace el backend actual)
            const latestReport = reports[0]; 

            // Función auxiliar para leer y sumar
            const sumScores = {
              produccion: 0, relaciones: 0, iniciativa: 0, cambio: 0, comunicacion: 0
            };
            const allObservations = {
              produccion: [] as string[], relaciones: [] as string[], iniciativa: [] as string[], cambio: [] as string[], comunicacion: [] as string[]
            };

            reports.forEach(report => {
              const scores: any = report.puntuaciones || {};
              const getValue = (keys: string[]) => {
                for (const key of keys) {
                  if (scores[key] !== undefined) return scores[key];
                }
                return undefined;
              };

              const getScore = (keys: string[]) => {
                const val = getValue(keys);
                if (Array.isArray(val)) return Math.max(0, Math.min(5, Number(val[0]) || 0));
                return Math.max(0, Math.min(5, Number(val) || 0));
              };

              const getObs = (keys: string[]) => {
                const val = getValue(keys);
                if (Array.isArray(val) && val.length > 1 && val[1]) return val[1];
                return '';
              };

              sumScores.produccion += getScore(['producción', 'produccion']);
              sumScores.relaciones += getScore(['relaciones interpersonales', 'relaciones_interpersonales']);
              sumScores.iniciativa += getScore(['iniciativa']);
              sumScores.cambio += getScore(['manejo del cambio']);
              sumScores.comunicacion += getScore(['comunicación', 'comunicacion']);

              const obsProd = getObs(['producción', 'produccion']);
              if (obsProd) allObservations.produccion.push(obsProd);

              const obsRel = getObs(['relaciones interpersonales', 'relaciones_interpersonales']);
              if (obsRel) allObservations.relaciones.push(obsRel);

              const obsIni = getObs(['iniciativa']);
              if (obsIni) allObservations.iniciativa.push(obsIni);

              const obsCam = getObs(['manejo del cambio']);
              if (obsCam) allObservations.cambio.push(obsCam);

              const obsCom = getObs(['comunicación', 'comunicacion']);
              if (obsCom) allObservations.comunicacion.push(obsCom);
            });

            const numReports = reports.length;

            return {
              id: latestReport.id,
              evaluado_id: employeeId,
              candidateName: latestReport.nombre_evaluado || 'Candidato Desconocido',
              currentPosition: latestReport.puesto_evaluado || 'Sin cargo',
              targetPosition: latestReport.ascenso || 'No especificado (Rol Superior)', 
              department: 'Consultoría', // Fallback, la BD actual no tiene departamento
              evaluationDate: latestReport.fecha_creacion || new Date().toISOString(),
              evaluator: latestReport.evaluador || 'RR.HH.',
              botResponse: latestReport.respuesta_bot,
              botAnalysis: latestReport.analisis_bot,
              competencies: {
                produccion: Number((sumScores.produccion / numReports).toFixed(1)),
                relaciones: Number((sumScores.relaciones / numReports).toFixed(1)),
                iniciativa: Number((sumScores.iniciativa / numReports).toFixed(1)),
                cambio: Number((sumScores.cambio / numReports).toFixed(1)),
                comunicacion: Number((sumScores.comunicacion / numReports).toFixed(1)),
              },
              observations: {
                produccion: allObservations.produccion.join('\n\n') || 'Sin observación registrada.',
                relaciones: allObservations.relaciones.join('\n\n') || 'Sin observación registrada.',
                iniciativa: allObservations.iniciativa.join('\n\n') || 'Sin observación registrada.',
                cambio: allObservations.cambio.join('\n\n') || 'Sin observación registrada.',
                comunicacion: allObservations.comunicacion.join('\n\n') || 'Sin observación registrada.',
              }
            };
          });

          setEvaluations(mappedEvaluations);
          setSelectedEvaluation(mappedEvaluations[0]);
          
          // Establecer el primer cargo objetivo disponible por defecto
          const uniquePositions = Array.from(new Set(mappedEvaluations.map(e => e.targetPosition)));
          if (uniquePositions.length > 0) {
            setSelectedTargetPosition(uniquePositions[0]);
          }
        } else {
          setEvaluations([]);
          setSelectedEvaluation(null);
          setSelectedTargetPosition('');
        }
      } catch (err) {
        setError('No se pudieron cargar los resultados. Verifica la conexión con n8n.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Cargando análisis de resultados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!evaluations.length || !selectedEvaluation) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">Aún no hay evaluaciones registradas</p>
      </div>
    );
  }

  // Preparar datos para el gráfico de radar
  const radarData = [
    {
      competency: 'Producción',
      valor: selectedEvaluation.competencies.produccion,
      requerido: 4
    },
    {
      competency: 'Iniciativa',
      valor: selectedEvaluation.competencies.iniciativa,
      requerido: 4
    },
    {
      competency: 'Comunicación',
      valor: selectedEvaluation.competencies.comunicacion,
      requerido: 4
    },
    {
      competency: 'Relaciones',
      valor: selectedEvaluation.competencies.relaciones,
      requerido: 4
    },
    {
      competency: 'Cambio',
      valor: selectedEvaluation.competencies.cambio,
      requerido: 4
    }
  ];

  // Obtener lista de cargos objetivos únicos para el filtro
  const targetPositions = Array.from(new Set(evaluations.map(e => e.targetPosition)));

  // Filtrar evaluaciones para la vista comparativa
  const evaluationsForComparison = evaluations.filter(e => e.targetPosition === selectedTargetPosition);

  // Datos de comparación entre candidatos (ya filtrados)
  const comparisonData = evaluationsForComparison.map(evaluation => ({
    id: evaluation.id,
    nombre: evaluation.candidateName.split(' ')[0],
    promedio: (
      evaluation.competencies.produccion +
      evaluation.competencies.iniciativa +
      evaluation.competencies.comunicacion +
      evaluation.competencies.relaciones +
      evaluation.competencies.cambio
    ) / 5
  }));

  // Calcular estadísticas
  const average = (
    selectedEvaluation.competencies.produccion +
    selectedEvaluation.competencies.iniciativa +
    selectedEvaluation.competencies.comunicacion +
    selectedEvaluation.competencies.relaciones +
    selectedEvaluation.competencies.cambio
  ) / 5;

  const strengths = Object.entries(selectedEvaluation.competencies).filter(([_, value]) => value >= 4).length;
  const developing = Object.entries(selectedEvaluation.competencies).filter(([_, value]) => value === 3).length;
  const improvements = Object.entries(selectedEvaluation.competencies).filter(([_, value]) => value < 3).length;

  const getRecommendation = (avg: number) => {
    if (avg >= 4.5) return { text: 'APROBADO PARA ASCENSO', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' };
    if (avg >= 3.5) return { text: 'CANDIDATO POTENCIAL', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    if (avg >= 3.0) return { text: 'REQUIERE DESARROLLO', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { text: 'NO RECOMENDADO', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' };
  };

  const recommendation = getRecommendation(average);

  // Datos para el historial de evolución (simulado)
  const evolutionData = [
    { periodo: 'Q1 2025', promedio: 3.2 },
    { periodo: 'Q2 2025', promedio: 3.6 },
    { periodo: 'Q3 2025', promedio: 4.0 },
    { periodo: 'Q4 2025', promedio: average }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-800 dark:to-purple-950 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl mb-2">Análisis de Resultados de Evaluación</h2>
            <p className="text-purple-100 text-sm">
              Análisis detallado y comparativo de las evaluaciones de competencias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector Dinámico (depende del viewMode) */}
          {viewMode === 'individual' ? (
            <div>
              <label className="block text-sm text-purple-100 mb-2">Seleccionar Evaluación</label>
              <div className="relative">
                <select
                  value={selectedEvaluation.id}
                  onChange={(e) => {
                    const evaluation = evaluations.find(ev => ev.id === e.target.value);
                    if (evaluation) setSelectedEvaluation(evaluation);
                  }}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none cursor-pointer text-white"
                >
                  {evaluations.map(evaluation => (
                    <option key={evaluation.id} value={evaluation.id} className="text-gray-900">
                      {evaluation.candidateName} - {evaluation.targetPosition}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-purple-100 mb-2">Puesto a Comparar</label>
              <div className="relative">
                <select
                  value={selectedTargetPosition}
                  onChange={(e) => setSelectedTargetPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none cursor-pointer text-white"
                >
                  {targetPositions.map(pos => (
                    <option key={pos} value={pos} className="text-gray-900">
                      Candidatos para: {pos}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-purple-100 mb-2">Modo de Visualización</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('individual')}
                className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                  viewMode === 'individual'
                    ? 'bg-white text-purple-700 shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                  viewMode === 'comparison'
                    ? 'bg-white text-purple-700 shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                Comparativo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Individual */}
      {viewMode === 'individual' && (
        <>
          {/* Información del Candidato */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Información del Candidato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Candidato</p>
                <p className="text-gray-900 dark:text-white">{selectedEvaluation.candidateName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Posición Actual</p>
                <p className="text-gray-900 dark:text-white">{selectedEvaluation.currentPosition}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Posición Objetivo</p>
                <p className="text-gray-900 dark:text-white">{selectedEvaluation.targetPosition}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Departamento</p>
                <p className="text-gray-900 dark:text-white">{selectedEvaluation.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha de Evaluación</p>
                <p className="text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedEvaluation.evaluationDate).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Evaluador</p>
                <p className="text-gray-900 dark:text-white">{selectedEvaluation.evaluator}</p>
              </div>
            </div>
          </div>

          {/* Recomendación y Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${recommendation.bgColor} rounded-xl p-6 border-2 border-current ${recommendation.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-6 h-6" />
                <p className="text-sm uppercase tracking-wide">Recomendación</p>
              </div>
              <p className="text-xl mt-2">{recommendation.text}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                <Target className="w-6 h-6" />
                <p className="text-sm">Promedio General</p>
              </div>
              <p className="text-3xl text-blue-700 dark:text-blue-400">{average.toFixed(2)}</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">de 5.0</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
                <p className="text-sm">Fortalezas</p>
              </div>
              <p className="text-3xl text-green-700 dark:text-green-400">{strengths}</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">competencias</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-6 h-6" />
                <p className="text-sm">En Desarrollo</p>
              </div>
              <p className="text-3xl text-amber-700 dark:text-amber-400">{developing}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">competencias</p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Radar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Perfil de Competencias
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <PolarAngleAxis 
                    dataKey="competency" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    className="dark:fill-gray-400"
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#6b7280' }} />
                  <Radar
                    name="Evaluación Actual"
                    dataKey="valor"
                    stroke="#7c3aed"
                    fill="#a855f7"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Requerido"
                    dataKey="requerido"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Evolución Trimestral */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4">Evolución de Desempeño</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 5]}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="promedio" 
                    stroke="#7c3aed" 
                    strokeWidth={3}
                    dot={{ fill: '#7c3aed', r: 6 }}
                    name="Promedio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Observaciones Detalladas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4">Observaciones por Competencia</h3>
            <div className="space-y-4">
              {Object.entries(selectedEvaluation.competencies).map(([key, value]) => {
                const competencyNames: Record<string, string> = {
                  produccion: 'Producción',
                  iniciativa: 'Iniciativa',
                  comunicacion: 'Comunicación',
                  relaciones: 'Relaciones Interpersonales',
                  cambio: 'Manejo del Cambio'
                };

                const getScoreColor = (score: number) => {
                  if (score >= 4) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
                  if (score === 3) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
                  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
                };

                return (
                  <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900 dark:text-white">{competencyNames[key]}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${getScoreColor(value)}`}>
                        {value}/5
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedEvaluation.observations[key as keyof typeof selectedEvaluation.observations]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Análisis del Bot (si existe) */}
          {(selectedEvaluation.botResponse || selectedEvaluation.botAnalysis) && (
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800/30 p-6 mt-6">
              <h3 className="text-lg text-[#7c3aed] mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" /> Análisis del Sistema (IA)
              </h3>
              <div className="space-y-4">
                {selectedEvaluation.botResponse && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-100 dark:border-purple-800/20">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Respuesta</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedEvaluation.botResponse}</p>
                  </div>
                )}
                {selectedEvaluation.botAnalysis && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-100 dark:border-purple-800/20">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Análisis Detallado</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedEvaluation.botAnalysis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de Decisión Individual */}
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => handlePromote(selectedEvaluation)}
              disabled={isPromoting}
              className={`flex-1 py-3 px-4 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                isPromoting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isPromoting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {isPromoting ? 'Ascendiendo...' : 'Ascender al empleado'}
            </button>
            <button
              onClick={() => {
                alert(`Decisión Registrada: El empleado ${selectedEvaluation.candidateName} no será ascendido por el momento.`);
              }}
              className="flex-1 py-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium rounded-xl border border-red-200 dark:border-red-800/30 hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center justify-center gap-2"
            >
              No ascender al empleado
            </button>
          </div>
        </>
      )}

      {/* Vista Comparativa */}
      {viewMode === 'comparison' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg text-purple-700 dark:text-purple-400">Comparación de Candidatos</h3>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800">
              {evaluationsForComparison.length} {evaluationsForComparison.length === 1 ? 'candidato' : 'candidatos'}
            </span>
          </div>
          
          {evaluationsForComparison.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="nombre" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 5]}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="promedio" name="Promedio de Competencias" radius={[8, 8, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell 
                        key={`cell-${entry.id}`} 
                        fill={index === 0 ? '#7c3aed' : index === 1 ? '#a855f7' : '#c084fc'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Tabla comparativa */}
              <div className="mt-8 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Seleccionar</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Candidato</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Producción</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Iniciativa</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Comunicación</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Relaciones</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Cambio</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationsForComparison.map((evaluation) => {
                      const avg = (
                        evaluation.competencies.produccion +
                        evaluation.competencies.iniciativa +
                        evaluation.competencies.comunicacion +
                        evaluation.competencies.relaciones +
                        evaluation.competencies.cambio
                      ) / 5;

                      return (
                        <tr 
                          key={evaluation.id}
                          onClick={() => {
                            setSelectedEvaluation(evaluation);
                            setViewMode('individual');
                          }}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="radio" 
                              name="promotionSelection" 
                              checked={selectedForPromotion === evaluation.id}
                              onChange={() => setSelectedForPromotion(evaluation.id)}
                              className="w-4 h-4 text-purple-600 dark:bg-gray-800 dark:border-gray-600"
                            />
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium hover:text-[#7c3aed] transition-colors">
                            {evaluation.candidateName}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.produccion}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.iniciativa}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.comunicacion}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.relaciones}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.cambio}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              avg >= 4 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                              avg >= 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                            }`}>
                              {avg.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Botón de Confirmación para Vista Comparativa */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    const target = evaluations.find(e => e.id === selectedForPromotion);
                    if (target) handlePromote(target);
                  }}
                  disabled={!selectedForPromotion || isPromoting}
                  className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors border ${
                    selectedForPromotion && !isPromoting
                      ? 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                  }`}
                >
                  {isPromoting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {isPromoting ? 'Ascendiendo...' : 'Confirmar decisión de ascenso'}
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              No hay candidatos postulando a este puesto exacto para comparar.
            </div>
          )}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg">
            <Download className="w-5 h-5" />
            Descargar Reporte PDF
          </button>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all shadow-md hover:shadow-lg">
            <FileText className="w-5 h-5" />
            Exportar a Excel
          </button>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-500 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-all">
            <Award className="w-5 h-5" />
            Enviar a Aprobación
          </button>
        </div>
      </div>
      {/* Modal de Ascenso Exitoso */}
      {showPromotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0 text-green-500">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Decisión Confirmada!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 whitespace-pre-wrap leading-relaxed">
              Felicidades,<br/> <strong className="text-green-600 dark:text-green-400 text-lg">{promotedEmployeeName}</strong> ha sido seleccionado para el ascenso y se ha registrado en el sistema.
            </p>
            <button
              onClick={() => {
                setShowPromotionModal(false);
                setSelectedForPromotion(null);
              }}
              className="w-full py-3 bg-[#7c3aed] text-white font-medium rounded-xl hover:bg-[#6d28d9] shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}