import { useState, useEffect } from 'react';
import { Save, FileText, Send, ChevronDown, Calendar, Clock, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { CompetencyRating } from './CompetencyRating';
import { postData } from '../services/n8nClient';

// ⚙️ Reemplaza esta URL con la de tu webhook de n8n o backend local
const N8N_REPORTE_URL = 'https://newserver-n8n.5bxr29.easypanel.host/webhook/rrhh';
const LOCAL_API_URL = 'http://localhost:3000/api/reportes';

interface WorkerData {
  id: string;
  name: string;
}

interface EvaluationFormProps {
  selectedPosition: string;
  onPositionChange: (position: string) => void;
  worker?: WorkerData | null;
  onBack?: () => void;
  onUploadPDF?: () => void;
}

interface Competency {
  name: string;
  rating: number;
  progress: number;
  observations: string;
}

export function EvaluationForm({ selectedPosition, onPositionChange, worker, onBack, onUploadPDF }: EvaluationFormProps) {
  const [candidateName, setCandidateName] = useState(worker?.name || '');
  const [candidateId, setCandidateId] = useState(worker?.id || '');
  const [currentPosition, setCurrentPosition] = useState(selectedPosition);
  const [department, setDepartment] = useState('Consultoría');
  const [evaluationDate, setEvaluationDate] = useState('2026-02-08');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [competencies, setCompetencies] = useState<Record<string, Competency>>({
    produccion: { name: 'Producción', rating: 3, progress: 60, observations: '' },
    iniciativa: { name: 'Iniciativa', rating: 4, progress: 80, observations: '' },
    comunicacion: { name: 'Comunicación', rating: 3, progress: 60, observations: '' },
    relaciones: { name: 'Relaciones Interpersonales', rating: 4, progress: 80, observations: '' },
    cambio: { name: 'Manejo del Cambio', rating: 3, progress: 60, observations: '' },
  });

  // Efecto para redirigir cuando el webhook es exitoso
  useEffect(() => {
    if (webhookStatus === 'success' && onBack) {
      const timer = setTimeout(() => {
        setWebhookStatus('idle'); // Reset por si vuelve a entrar
        onBack();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [webhookStatus, onBack]);

  const updateCompetency = (key: string, updates: Partial<Competency>) => {
    setCompetencies(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const handleGenerarReporte = async () => {
    if (!candidateName.trim()) {
      alert('Por favor, ingresa el nombre del candidato antes de generar el reporte.');
      return;
    }

    setWebhookStatus('loading');

    const payload = {
      "tipo de operacion": "form",
      id: candidateId,
      nombre: candidateName.trim(),
      ascenso: selectedPosition,
      puntuaciones: {
        'producción': [competencies.produccion.rating, competencies.produccion.observations],
        'relaciones interpersonales': [competencies.relaciones.rating, competencies.relaciones.observations],
        'iniciativa': [competencies.iniciativa.rating, competencies.iniciativa.observations],
        'manejo del cambio': [competencies.cambio.rating, competencies.cambio.observations],
        'comunicación': [competencies.comunicacion.rating, competencies.comunicacion.observations],
      },
    };

    try {
      // Guardar primero en la base de datos local
      await postData(LOCAL_API_URL, payload);
      // Notificar a n8n por el webhook
      await postData(N8N_REPORTE_URL, payload);
      
      setWebhookStatus('success');
    } catch {
      setWebhookStatus('error');
    }
  };

  const positions = [
    'Consultor Senior',
    'Director General de Finanzas',
    'Gerente de Proyectos',
    'Director de Operaciones'
  ];

  const competencyKeys = Object.keys(competencies);
  const firstColumnKeys = competencyKeys.slice(0, 3);
  const secondColumnKeys = competencyKeys.slice(3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      {/* Header con fecha y hora */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 mb-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Volver a la lista de trabajadores"
            >
              <ArrowLeft className="w-5 h-5 text-[#7c3aed]" />
            </button>
          )}
          <div>
            <h2 className="text-xl text-[#7c3aed] mb-1">Evaluación de Candidato</h2>
            <p className="text-sm text-[#64748b] dark:text-gray-400">Complete todos los campos para generar el reporte</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#64748b] dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>08/02/2026</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Información del Candidato */}
      <div className="mb-8">
        <h3 className="text-lg text-[#7c3aed] mb-4">Información del Candidato</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 text-sm text-[#64748b] dark:text-gray-400">Nombre Completo *</label>
            <input
              type="text"
              value={candidateName}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-[#64748b] dark:text-gray-400">Posición Actual *</label>
            <input
              type="text"
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              placeholder="Ej: Consultor Jr."
              className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-[#64748b] dark:text-gray-400">Departamento *</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Ej: Finanzas Corporativas"
              className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-[#64748b] dark:text-gray-400">Posición Objetivo *</label>
            <div className="relative">
              <select
                value={selectedPosition}
                onChange={(e) => onPositionChange(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all appearance-none cursor-pointer text-gray-900 dark:text-white"
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] dark:text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Botón Redirección a Gestor de Documentos */}
      {onUploadPDF && (
        <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg text-[#7c3aed] mb-1 flex items-center gap-2">
              <Upload className="w-5 h-5" /> ¿Tienes la evaluación en PDF?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ve al Gestor de Documentos para subir el formulario físico y enviarlo directamente.
            </p>
          </div>
          <button
            onClick={onUploadPDF}
            className="w-full sm:w-auto px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Ir a Subir Documento PDF
          </button>
        </div>
      )}

      {/* Evaluación de Competencias en Dos Columnas */}
      <div className="mb-8">
        <h3 className="text-lg text-[#7c3aed] mb-4">Evaluación de Competencias Clave</h3>
        <p className="text-sm text-[#64748b] dark:text-gray-400 mb-6">
          Evalúe cada competencia en una escala del 1 al 5, donde 1 es Insuficiente y 5 es Experto
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primera Columna */}
          <div className="space-y-6">
            {firstColumnKeys.map((key) => (
              <CompetencyRating
                key={key}
                competency={competencies[key]}
                onChange={(updates) => updateCompetency(key, updates)}
              />
            ))}
          </div>

          {/* Segunda Columna */}
          <div className="space-y-6">
            {secondColumnKeys.map((key) => (
              <CompetencyRating
                key={key}
                competency={competencies[key]}
                onChange={(updates) => updateCompetency(key, updates)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de Evaluación */}
      <div className="mb-8 bg-[#f8fafc] dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-[#7c3aed] mb-3">Resumen de Evaluación</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl text-[#7c3aed] mb-1">
              {(Object.values(competencies).reduce((sum, c) => sum + c.rating, 0) / Object.values(competencies).length).toFixed(1)}
            </p>
            <p className="text-xs text-[#64748b] dark:text-gray-400">Promedio General</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#10b981] mb-1">
              {Object.values(competencies).filter(c => c.rating >= 4).length}
            </p>
            <p className="text-xs text-[#64748b] dark:text-gray-400">Fortalezas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#f59e0b] mb-1">
              {Object.values(competencies).filter(c => c.rating === 3).length}
            </p>
            <p className="text-xs text-[#64748b] dark:text-gray-400">En Desarrollo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#ef4444] mb-1">
              {Object.values(competencies).filter(c => c.rating < 3).length}
            </p>
            <p className="text-xs text-[#64748b] dark:text-gray-400">Áreas de Mejora</p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-all shadow-md hover:shadow-lg">
          <Save className="w-5 h-5" />
          Guardar Evaluación
        </button>

        <button
          onClick={handleGenerarReporte}
          disabled={webhookStatus === 'loading'}
          className="flex items-center gap-2 px-6 py-3 bg-[#a855f7] text-white rounded-lg hover:bg-[#9333ea] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {webhookStatus === 'loading'
            ? (<><Loader2 className="w-5 h-5 animate-spin" />Enviando...</>)
            : (<><FileText className="w-5 h-5" />Generar Reporte 360°</>)
          }
        </button>

        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-[#7c3aed] border-2 border-[#7c3aed] rounded-lg hover:bg-[#faf5ff] dark:hover:bg-gray-600 transition-all">
          <Send className="w-5 h-5" />
          Enviar a Junta de Socios
        </button>

        <button className="ml-auto px-6 py-3 text-[#64748b] dark:text-gray-400 hover:text-[#7c3aed] transition-colors">
          Cancelar
        </button>
      </div>

      {/* Modal de Envío Exitoso Genérico */}
      {webhookStatus === 'success' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              ¡Operación Exitosa!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              El reporte manual de evaluación se ha enviado correctamente.
            </p>
            <button
              onClick={() => {
                setWebhookStatus('idle');
                if (onBack) onBack();
              }}
              className="w-full py-3 bg-[#7c3aed] text-white rounded-lg font-medium hover:bg-[#6d28d9] transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Error local */}
      {webhookStatus === 'error' && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Error al enviar el reporte. Verifica la URL del webhook y tu conexión.</span>
        </div>
      )}
    </div>
  );
}