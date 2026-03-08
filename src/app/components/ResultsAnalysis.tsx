import { useState } from 'react';
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
  Calendar
} from 'lucide-react';

interface EvaluationData {
  id: string;
  candidateName: string;
  currentPosition: string;
  targetPosition: string;
  department: string;
  evaluationDate: string;
  evaluator: string;
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
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationData>(mockEvaluations[0]);
  const [viewMode, setViewMode] = useState<'individual' | 'comparison'>('individual');

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

  // Datos de comparación entre candidatos
  const comparisonData = mockEvaluations.map(evaluation => ({
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

        {/* Selector de evaluación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-purple-100 mb-2">Seleccionar Evaluación</label>
            <div className="relative">
              <select
                value={selectedEvaluation.id}
                onChange={(e) => {
                  const evaluation = mockEvaluations.find(ev => ev.id === e.target.value);
                  if (evaluation) setSelectedEvaluation(evaluation);
                }}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none cursor-pointer text-white"
              >
                {mockEvaluations.map(evaluation => (
                  <option key={evaluation.id} value={evaluation.id} className="text-gray-900">
                    {evaluation.candidateName} - {evaluation.targetPosition}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
            </div>
          </div>

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
        </>
      )}

      {/* Vista Comparativa */}
      {viewMode === 'comparison' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-6">Comparación entre Candidatos</h3>
          
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
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Candidato</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Posición Objetivo</th>
                  <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Producción</th>
                  <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Iniciativa</th>
                  <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Comunicación</th>
                  <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Relaciones</th>
                  <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Cambio</th>
                  <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {mockEvaluations.map((evaluation) => {
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
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{evaluation.candidateName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{evaluation.targetPosition}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.produccion}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.iniciativa}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.comunicacion}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.relaciones}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-900 dark:text-white">{evaluation.competencies.cambio}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          avg >= 4 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          avg >= 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
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
    </div>
  );
}