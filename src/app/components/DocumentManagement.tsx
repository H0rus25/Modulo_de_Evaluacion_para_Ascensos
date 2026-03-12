import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  File,
  Loader2,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { postFormData } from '../services/n8nClient';

const N8N_DOCUMENT_URL = 'https://newserver-n8n.5bxr29.easypanel.host/webhook/rrhh';

interface WorkerData {
  id: string;
  name: string;
}

interface DocumentManagementProps {
  worker?: WorkerData | null;
  selectedPosition?: string;
  onBack?: () => void;
}

export function DocumentManagement({ worker, selectedPosition, onBack }: DocumentManagementProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  // Preview URL for cleanup
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  if (!worker) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No hay empleado seleccionado</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Debes seleccionar un empleado desde la lista para enviarle un formulario de evaluación.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors"
            >
              Volver a la Lista de Trabajadores
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadError('');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleSubirDocumento = async () => {
    if (!selectedFile) {
      setUploadError('Por favor selecciona un archivo PDF primero.');
      return;
    }

    setUploadStatus('loading');
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('tipo de operacion', 'doc');
      formData.append('id', worker.id);
      formData.append('nombre', worker.name);
      formData.append('ascenso', selectedPosition || 'No especificado');
      formData.append('fileName', selectedFile.name);

      const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      formData.append('fileType', fileExt);

      formData.append('document', selectedFile);

      await postFormData(N8N_DOCUMENT_URL, formData);
      setUploadStatus('success');
    } catch (error) {
      console.error("Error subiendo el documento:", error);
      setUploadStatus('error');
      setUploadError('Ocurrió un error al enviar el documento a los servidores.');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toUpperCase();
    if (ext === 'PDF') return <FileText className="w-8 h-8 text-red-500" />;
    if (ext === 'DOCX' || ext === 'DOC') return <FileCheck className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-800 dark:to-purple-950 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Volver atrás"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold mb-1">Cargar Evaluación Física</h2>
              <p className="text-purple-100 text-sm">
                Sube el formulario de evaluación para <strong>{worker.name}</strong>
              </p>
            </div>
          </div>
          <Upload className="w-12 h-12 opacity-80" />
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Upload Area */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 transition-all flex flex-col items-center justify-center text-center w-full min-h-[300px] ${isDragging
            ? 'border-[#a855f7] bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400'
            }`}
        >
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-10 h-10 text-[#7c3aed] dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
            Arrastra el documento aquí
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            o haz clic para buscarlo en tus archivos. (Solo formato PDF).
          </p>
          <label className="inline-block px-8 py-4 bg-[#7c3aed] text-white rounded-xl font-medium hover:bg-[#6d28d9] shadow-lg shadow-purple-500/30 transition-all cursor-pointer hover:shadow-purple-500/50 hover:-translate-y-0.5">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
            Explorar Archivos
          </label>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7c3aed]" />
              Documento Cargado
            </h3>

            <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                Información
              </button>
              <button
                onClick={() => setViewMode('details')}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 rounded-md transition-colors ${viewMode === 'details'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                <Eye className="w-4 h-4" /> Vista Previa
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-[300px] md:max-w-md">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Tipo: {selectedFile.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button
                  onClick={handleDeleteFile}
                  disabled={uploadStatus === 'loading'}
                  className="flex-1 md:flex-none px-4 py-3 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="md:hidden">Eliminar</span>
                </button>
                <button
                  onClick={handleSubirDocumento}
                  disabled={uploadStatus === 'loading'}
                  className="flex-none px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === 'loading' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</>
                  ) : (
                    <><Upload className="w-5 h-5" /> Subir Documento</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Previsualización de Documento</span>
                <span className="text-xs text-gray-400">{selectedFile.name}</span>
              </div>
              <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                {selectedFile.type === 'application/pdf' ? (
                  <iframe
                    src={previewUrl || ''}
                    className="w-full h-full border-0"
                    title="Previsualización del PDF"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8 text-center">
                    {getFileIcon(selectedFile.name)}
                    <p className="mt-4 font-medium text-lg">Vista previa no disponible</p>
                    <p className="mt-1 text-sm">El formato del archivo no permite la visualización directa en el navegador.</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={handleDeleteFile}
                  disabled={uploadStatus === 'loading'}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubirDocumento}
                  disabled={uploadStatus === 'loading'}
                  className="px-6 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {uploadStatus === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Enviar Documento</>
                  )}
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="mt-4 flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30">
              <AlertCircle className="w-5 h-5 shrink-0" /> {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Modal de Éxito de Gestor Documental */}
      {uploadStatus === 'success' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Operación Exitosa!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Procesado con éxito. Agradecemos su colaboración.
            </p>
            <button
              onClick={() => {
                setUploadStatus('idle');
                setSelectedFile(null);
                if (onBack) onBack();
              }}
              className="w-full py-4 bg-[#10b981] text-white rounded-xl font-medium hover:bg-[#059669] shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
