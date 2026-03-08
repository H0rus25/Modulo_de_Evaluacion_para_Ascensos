import { Building2, User, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7c3aed] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-[#7c3aed]">Premium Consultores</h1>
              <p className="text-xs text-[#64748b] dark:text-gray-400">Plataforma de Gestión de Talento</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-[#64748b] dark:text-gray-400 hover:text-[#7c3aed] transition-colors">
              Panel Principal
            </a>
            <a href="#" className="text-sm text-[#7c3aed]">
              Evaluaciones
            </a>
            <a href="#" className="text-sm text-[#64748b] dark:text-gray-400 hover:text-[#7c3aed] transition-colors">
              Candidatos
            </a>
            <a href="#" className="text-sm text-[#64748b] dark:text-gray-400 hover:text-[#7c3aed] transition-colors">
              Reportes
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-[#64748b] dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-[#64748b] dark:text-gray-400" />
              )}
            </button>
            
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-[#64748b] dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#a855f7] rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="w-9 h-9 bg-[#f3e8ff] dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm text-gray-900 dark:text-white">María González</p>
                <p className="text-xs text-[#64748b] dark:text-gray-400">RRHH Senior</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}