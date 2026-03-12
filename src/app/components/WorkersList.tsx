import { useState, useEffect } from 'react';
import { Search, User, ChevronRight, Star, TrendingUp, Loader2, AlertCircle, Lock } from 'lucide-react';
import { getData } from '../services/n8nClient';

const N8N_WORKERS_URL = 'http://localhost:3000/api/trabajadores'; // URL del nuevo backend Node.js

// Interfaz que viene de la BD a través de n8n
interface DBTrabajador {
  id: string; // uuid
  nombre: string;
  puesto: string;
  cédula: number; // bigint
  foto: string | null;
  calificados: any; // jsonb
}

// Interfaz consumida por el frontend
interface Worker {
  id: string;
  name: string;
  position: string;
  department: string;
  performance: number;
  status: 'active' | 'pending' | 'evaluated';
  avatar?: string;
}

interface WorkersListProps {
  onSelectWorker?: (worker: Worker) => void;
}

export function WorkersList({ onSelectWorker }: WorkersListProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'pending' | 'evaluated'>('all');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Llamar a n8n
        const dbData = await getData<DBTrabajador[] | null>(N8N_WORKERS_URL);
        
        if (!dbData) {
          setWorkers([]);
          return;
        }

        // Mapear de la base de datos a la estructura del frontend
        const mappedWorkers: Worker[] = dbData.map(dbWorker => {
          
          // Lógica para saber el estado basado en si tiene reseña en "calificados" (arreglo de IDs)
          let hasEvaluations = false;
          if (Array.isArray(dbWorker.calificados) && dbWorker.calificados.length > 0) {
            hasEvaluations = true;
          } else if (dbWorker.calificados !== null && typeof dbWorker.calificados === 'object' && Object.keys(dbWorker.calificados).length > 0) {
            hasEvaluations = true; // Por si acaso sigue viniendo como objeto
          }
          const status = hasEvaluations ? 'evaluated' : 'pending';

          return {
            id: dbWorker.id,
            name: dbWorker.nombre,
            position: dbWorker.puesto || 'Sin cargo',
            department: 'Consultoría', // Fallback, la BD actual no tiene depto
            performance: 0, // Fallback, calculable a futuro con la data de reseñas
            status: status,
            avatar: dbWorker.foto || undefined
          };
        });

        setWorkers(mappedWorkers);
      } catch (err) {
        setError('No se pudo cargar la lista de trabajadores. Verifica tu conexión a n8n.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || worker.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Worker['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'evaluated':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }
  };

  const getStatusText = (status: Worker['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'evaluated':
        return 'Evaluado';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl text-gray-900 dark:text-white mb-4">Lista de Trabajadores</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === 'all'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Todos ({workers.length})
          </button>
          <button
            onClick={() => setSelectedFilter('active')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === 'active'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Activos ({workers.filter(w => w.status === 'active').length})
          </button>
          <button
            onClick={() => setSelectedFilter('pending')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === 'pending'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Pendientes ({workers.filter(w => w.status === 'pending').length})
          </button>
          <button
            onClick={() => setSelectedFilter('evaluated')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === 'evaluated'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Evaluados ({workers.filter(w => w.status === 'evaluated').length})
          </button>
        </div>
      </div>

      {/* Workers List Area */}
      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Cargando trabajadores...</p>
          </div>
        ) : error ? (
          <div className="p-8 mx-6 my-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron trabajadores</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredWorkers.map(worker => {
              const isEvaluated = worker.status === 'evaluated';
              return (
              <div
                key={worker.id}
                onClick={isEvaluated ? undefined : () => onSelectWorker?.(worker)}
                className={`p-4 transition-colors group ${
                  isEvaluated 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/50' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isEvaluated ? 'bg-gray-200 dark:bg-gray-700' : 'bg-[#f3e8ff] dark:bg-purple-900/30'
                  }`}>
                    <User className={`w-6 h-6 ${isEvaluated ? 'text-gray-500' : 'text-[#7c3aed]'}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-gray-900 dark:text-white truncate">{worker.name}</h3>
                      {isEvaluated ? (
                        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#7c3aed] transition-colors flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                      {worker.position} • {worker.department}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Performance */}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{worker.performance}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(worker.status)}`}>
                        {getStatusText(worker.status)}
                      </span>

                      {/* High Performer Badge */}
                      {worker.performance >= 4.5 && (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span className="text-xs">Alto Rendimiento</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
