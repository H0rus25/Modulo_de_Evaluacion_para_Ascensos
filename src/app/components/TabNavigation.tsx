import { Users, ClipboardList, FileBarChart, FolderOpen, UserPlus } from 'lucide-react';
import { useAuth, Role } from '../contexts/AuthContext';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface TabDef {
  id: string;
  label: string;
  icon: any;
  roles: Role[];
}

const allTabs: TabDef[] = [
  { id: 'employees', label: 'Lista de Empleados', icon: Users, roles: ['empleado', 'rrhh'] },
  { id: 'entry', label: 'Ingreso de Datos', icon: UserPlus, roles: ['rrhh'] },
  { id: 'documents', label: 'Documentos de Empleados', icon: FolderOpen, roles: ['rrhh'] },
  { id: 'results', label: 'Análisis de Resultados', icon: FileBarChart, roles: ['rrhh'] },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { user } = useAuth();
  
  // Filtrar las pestañas según el rol
  const tabs = allTabs.filter(tab => user?.role && tab.roles.includes(user.role));
  return (
    <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Módulos
      </h3>
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 text-left
                ${isActive 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-600'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}