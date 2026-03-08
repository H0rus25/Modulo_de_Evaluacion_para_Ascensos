import { Shield, Heart, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#f3e8ff] dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h4 className="text-[#7c3aed] mb-1">Integridad</h4>
              <p className="text-sm text-[#64748b] dark:text-gray-400">
                Evaluaciones justas, transparentes y basadas en mérito
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#e9d5ff] dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-[#a855f7]" />
            </div>
            <div>
              <h4 className="text-[#7c3aed] mb-1">Calidad</h4>
              <p className="text-sm text-[#64748b] dark:text-gray-400">
                Estándares de excelencia en gestión de talento
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#d1fae5] dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <h4 className="text-[#7c3aed] mb-1">Respeto</h4>
              <p className="text-sm text-[#64748b] dark:text-gray-400">
                Valoramos el desarrollo profesional de cada colaborador
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#64748b] dark:text-gray-400">
            © 2026 Premium Consultores. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-[#64748b] dark:text-gray-400">
            <a href="#" className="hover:text-[#7c3aed] transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-[#7c3aed] transition-colors">Términos de Uso</a>
            <a href="#" className="hover:text-[#7c3aed] transition-colors">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  );
}