import { useState } from 'react';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(credentials.username, credentials.password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-gray-700">
        
        {/* Panel Izquierdo - Información (Estilo UdoConnect pero morado) */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-900 p-8 text-white flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenido a
          </h1>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white mb-6">
            Gestión de Ascensos
          </h2>
          <p className="text-purple-100 mb-8 leading-relaxed">
            Accede al sistema centralizado para evaluar compañeros o administrar métricas consolidadas por recursos humanos.
          </p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-purple-100">
              <CheckCircle size={20} className="text-purple-300" />
              <span>Evaluaciones 360° en tiempo real</span>
            </li>
            <li className="flex items-center gap-3 text-purple-100">
              <CheckCircle size={20} className="text-purple-300" />
              <span>Análisis automático de métricas</span>
            </li>
            <li className="flex items-center gap-3 text-purple-100">
              <CheckCircle size={20} className="text-purple-300" />
              <span>Control de acceso por roles</span>
            </li>
          </ul>
        </div>

        {/* Panel Derecho - Formulario */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Iniciar Sesión
            </h2>

            {error && (
              <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="Usuario"
                    disabled={isLoading}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    disabled={isLoading}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                  <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 bg-gray-100 border-gray-300" />
                  <span>Recuérdame</span>
                </label>
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Credenciales de prueba:</p>
              <div className="mt-2 text-xs flex justify-center gap-4">
                <code>RRHH: admin / admin123</code>
                <code>Empleado: empleado / emp123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
