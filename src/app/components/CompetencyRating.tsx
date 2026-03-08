import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface Competency {
  name: string;
  rating: number;
  progress: number;
  observations: string;
}

interface CompetencyRatingProps {
  competency: Competency;
  onChange: (updates: Partial<Competency>) => void;
}

export function CompetencyRating({ competency, onChange }: CompetencyRatingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const updateRating = (newRating: number) => {
    const clampedRating = Math.max(1, Math.min(5, newRating));
    const newProgress = (clampedRating / 5) * 100;
    onChange({ rating: clampedRating, progress: newProgress });
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-[#10b981]';
    if (progress >= 60) return 'bg-[#a855f7]';
    if (progress >= 40) return 'bg-[#f59e0b]';
    return 'bg-[#ef4444]';
  };
  
  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Insuficiente', 'Básico', 'Competente', 'Avanzado', 'Experto'];
    return labels[rating] || '';
  };
  
  return (
    <div className="bg-[#f8fafc] dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-[#7c3aed] mb-2">{competency.name}</h3>
          <p className="text-sm text-[#64748b] dark:text-gray-400 mb-3">{getRatingLabel(competency.rating)}</p>
          
          {/* Barra de Progreso */}
          <div className="relative h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full ${getProgressColor(competency.progress)} transition-all duration-300 ease-out`}
              style={{ width: `${competency.progress}%` }}
            />
          </div>
        </div>
        
        {/* Controles de Calificación */}
        <div className="flex items-center gap-3 ml-6">
          <button
            onClick={() => updateRating(competency.rating - 1)}
            disabled={competency.rating <= 1}
            className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4 text-[#64748b] dark:text-gray-300" />
          </button>
          
          <div className="w-16 h-9 flex items-center justify-center bg-white dark:bg-gray-600 border-2 border-[#7c3aed] rounded-lg">
            <span className="text-[#7c3aed]">{competency.rating}</span>
          </div>
          
          <button
            onClick={() => updateRating(competency.rating + 1)}
            disabled={competency.rating >= 5}
            className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 text-[#64748b] dark:text-gray-300" />
          </button>
        </div>
      </div>
      
      {/* Selector de Rating Rápido */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => updateRating(rating)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              competency.rating === rating
                ? 'bg-[#7c3aed] text-white shadow-md'
                : 'bg-white dark:bg-gray-600 text-[#64748b] dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:border-[#a855f7]'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      
      {/* Campo de Observaciones */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-[#a855f7] hover:text-[#7c3aed] mb-2 transition-colors"
      >
        {isExpanded ? '− Ocultar' : '+ Agregar'} observaciones
      </button>
      
      {isExpanded && (
        <textarea
          value={competency.observations}
          onChange={(e) => onChange({ observations: e.target.value })}
          placeholder="Ej: Demuestra poca paciencia en situaciones de alta presión, pero excelente capacidad de persuasión con clientes..."
          rows={3}
          className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent resize-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      )}
    </div>
  );
}