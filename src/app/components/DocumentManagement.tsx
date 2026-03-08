import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle,
  AlertCircle,
  File,
  FileCheck,
  Calendar,
  User,
  Briefcase,
  Mail,
  Phone,
  Award,
  GraduationCap,
  Languages,
  Target,
  TrendingUp
} from 'lucide-react';

interface EmployeeDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  size: string;
  status: 'processed' | 'pending' | 'error';
  extractedData?: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      position: string;
      department: string;
      joinDate: string;
    };
    education: {
      degree: string;
      institution: string;
      year: string;
    }[];
    experience: {
      position: string;
      company: string;
      duration: string;
      description: string;
    }[];
    skills: string[];
    certifications: string[];
    languages: {
      language: string;
      level: string;
    }[];
    competencyScores?: {
      technical: number;
      leadership: number;
      communication: number;
      innovation: number;
    };
  };
}

// Datos de ejemplo
const mockDocuments: EmployeeDocument[] = [
  {
    id: '1',
    fileName: 'CV_Ana_Maria_Gonzalez.pdf',
    fileType: 'PDF',
    uploadDate: '2026-03-05',
    size: '2.4 MB',
    status: 'processed',
    extractedData: {
      personalInfo: {
        name: 'Ana María González',
        email: 'ana.gonzalez@premiumconsultores.com',
        phone: '+52 55 1234 5678',
        position: 'Consultor Jr.',
        department: 'Finanzas Corporativas',
        joinDate: '2023-01-15'
      },
      education: [
        {
          degree: 'MBA en Finanzas',
          institution: 'ITAM',
          year: '2022'
        },
        {
          degree: 'Licenciatura en Administración',
          institution: 'Universidad Nacional',
          year: '2020'
        }
      ],
      experience: [
        {
          position: 'Analista Financiero',
          company: 'Banco Internacional',
          duration: '2020-2022',
          description: 'Análisis de riesgo crediticio y evaluación de inversiones.'
        },
        {
          position: 'Practicante de Finanzas',
          company: 'Grupo Empresarial XYZ',
          duration: '2019-2020',
          description: 'Apoyo en reportes financieros y proyecciones.'
        }
      ],
      skills: ['Excel Avanzado', 'Power BI', 'SQL', 'Python', 'Modelado Financiero', 'Bloomberg Terminal'],
      certifications: ['CFA Level II', 'Certificación en Risk Management', 'Six Sigma Green Belt'],
      languages: [
        { language: 'Español', level: 'Nativo' },
        { language: 'Inglés', level: 'Avanzado (C1)' },
        { language: 'Francés', level: 'Intermedio (B1)' }
      ],
      competencyScores: {
        technical: 4.5,
        leadership: 4.0,
        communication: 4.2,
        innovation: 4.8
      }
    }
  },
  {
    id: '2',
    fileName: 'Certificaciones_Roberto_Sanchez.pdf',
    fileType: 'PDF',
    uploadDate: '2026-03-03',
    size: '1.8 MB',
    status: 'processed',
    extractedData: {
      personalInfo: {
        name: 'Roberto Sánchez',
        email: 'roberto.sanchez@premiumconsultores.com',
        phone: '+52 55 9876 5432',
        position: 'Analista Senior',
        department: 'Operaciones',
        joinDate: '2021-06-01'
      },
      education: [
        {
          degree: 'Maestría en Gestión de Proyectos',
          institution: 'Tec de Monterrey',
          year: '2021'
        }
      ],
      experience: [
        {
          position: 'Coordinador de Proyectos',
          company: 'Consultora ABC',
          duration: '2018-2021',
          description: 'Gestión de proyectos de transformación digital.'
        }
      ],
      skills: ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Microsoft Project'],
      certifications: ['PMP', 'Scrum Master Certified', 'ITIL Foundation'],
      languages: [
        { language: 'Español', level: 'Nativo' },
        { language: 'Inglés', level: 'Intermedio (B2)' }
      ],
      competencyScores: {
        technical: 3.8,
        leadership: 4.2,
        communication: 3.5,
        innovation: 4.0
      }
    }
  },
  {
    id: '3',
    fileName: 'Evaluacion_Desempeño_Laura_Martinez.docx',
    fileType: 'DOCX',
    uploadDate: '2026-03-01',
    size: '856 KB',
    status: 'pending'
  }
];

export function DocumentManagement() {
  const [documents, setDocuments] = useState<EmployeeDocument[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(documents[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

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
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      const newDocument: EmployeeDocument = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'pending'
      };
      
      setDocuments(prev => [newDocument, ...prev]);
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Procesado
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'PDF') return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType === 'DOCX' || fileType === 'DOC') return <FileCheck className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-800 dark:to-purple-950 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl mb-2">Gestión de Documentos de Empleados</h2>
            <p className="text-purple-100 text-sm">
              Cargue y analice CVs, certificaciones y documentos de evaluación
            </p>
          </div>
          <Upload className="w-10 h-10 opacity-80" />
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }`}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg text-gray-900 dark:text-white mb-2">
            Arrastra documentos aquí o haz clic para seleccionar
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Formatos soportados: PDF, DOC, DOCX (máx. 10 MB)
          </p>
          <label className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all cursor-pointer">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
            Seleccionar Archivos
          </label>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-gray-900 dark:text-white">
          Documentos Cargados ({documents.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('details')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'details'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Detalles
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Documento</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Tamaño</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Estado</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.fileType)}
                        <span className="text-sm text-gray-900 dark:text-white">{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{doc.fileType}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(doc.uploadDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{doc.size}</td>
                    <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {doc.status === 'processed' && (
                          <button
                            onClick={() => {
                              setSelectedDocument(doc);
                              setViewMode('details');
                            }}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details View */}
      {viewMode === 'details' && selectedDocument && selectedDocument.extractedData && (
        <div className="space-y-6">
          {/* Document Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Seleccionar documento para análisis
            </label>
            <select
              value={selectedDocument.id}
              onChange={(e) => {
                const doc = documents.find(d => d.id === e.target.value);
                if (doc) setSelectedDocument(doc);
              }}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            >
              {documents.filter(d => d.status === 'processed').map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.fileName}
                </option>
              ))}
            </select>
          </div>

          {/* Personal Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre Completo</p>
                <p className="text-gray-900 dark:text-white">{selectedDocument.extractedData.personalInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="text-gray-900 dark:text-white">{selectedDocument.extractedData.personalInfo.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Teléfono
                </p>
                <p className="text-gray-900 dark:text-white">{selectedDocument.extractedData.personalInfo.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Posición Actual
                </p>
                <p className="text-gray-900 dark:text-white">{selectedDocument.extractedData.personalInfo.position}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Departamento</p>
                <p className="text-gray-900 dark:text-white">{selectedDocument.extractedData.personalInfo.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha de Ingreso
                </p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedDocument.extractedData.personalInfo.joinDate).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Competency Scores */}
          {selectedDocument.extractedData.competencyScores && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Puntuación de Competencias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(selectedDocument.extractedData.competencyScores).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    technical: 'Técnica',
                    leadership: 'Liderazgo',
                    communication: 'Comunicación',
                    innovation: 'Innovación'
                  };
                  
                  return (
                    <div key={key} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <p className="text-sm text-purple-700 dark:text-purple-400 mb-2">{labels[key]}</p>
                      <div className="flex items-end gap-2">
                        <p className="text-3xl text-purple-700 dark:text-purple-300">{value}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">/5.0</p>
                      </div>
                      <div className="mt-2 h-2 bg-purple-200 dark:bg-purple-900/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all"
                          style={{ width: `${(value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Educación
            </h3>
            <div className="space-y-4">
              {selectedDocument.extractedData.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="text-gray-900 dark:text-white">{edu.degree}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experiencia Profesional
            </h3>
            <div className="space-y-4">
              {selectedDocument.extractedData.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="text-gray-900 dark:text-white">{exp.position}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{exp.duration}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedDocument.extractedData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certificaciones
              </h3>
              <ul className="space-y-2">
                {selectedDocument.extractedData.certifications.map((cert, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Idiomas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedDocument.extractedData.languages.map((lang, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white mb-1">{lang.language}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{lang.level}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg">
                <Download className="w-5 h-5" />
                Exportar Análisis
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg">
                <CheckCircle className="w-5 h-5" />
                Crear Evaluación Automática
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                <FileText className="w-5 h-5" />
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'details' && (!selectedDocument || !selectedDocument.extractedData) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 dark:text-white mb-2">
            No hay datos para mostrar
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona un documento procesado para ver los detalles extraídos
          </p>
        </div>
      )}
    </div>
  );
}
