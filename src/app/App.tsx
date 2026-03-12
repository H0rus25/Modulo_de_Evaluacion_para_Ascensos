import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { EvaluationForm } from './components/EvaluationForm';
import { WorkersList } from './components/WorkersList';
import { ResultsAnalysis } from './components/ResultsAnalysis';
import { DocumentManagement } from './components/DocumentManagement';
import { EmployeeDataEntry } from './components/EmployeeDataEntry';
import { TabNavigation } from './components/TabNavigation';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';

// Define Worker locally o impórtalo si lo exportaste de WorkersList
interface WorkerData {
  id: string;
  name: string;
}

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [selectedPosition, setSelectedPosition] = useState('Consultor Senior');
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedWorkerForEval, setSelectedWorkerForEval] = useState<WorkerData | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <WorkersList 
            onSelectWorker={(worker) => {
              setSelectedWorkerForEval({ id: worker.id, name: worker.name });
              setActiveTab('evaluation');
            }} 
          />
        );
      
      case 'entry':
        return <EmployeeDataEntry />;
      
      case 'documents':
        return (
          <DocumentManagement 
            worker={selectedWorkerForEval}
            selectedPosition={selectedPosition}
            onBack={() => setActiveTab('employees')}
          />
        );
      
      case 'evaluation':
        return (
          <EvaluationForm 
            selectedPosition={selectedPosition}
            onPositionChange={setSelectedPosition}
            worker={selectedWorkerForEval}
            onBack={() => setActiveTab('employees')}
            onUploadPDF={() => setActiveTab('documents')}
          />
        );
      
      case 'results':
        return <ResultsAnalysis />;
      
      default:
        return (
          <WorkersList 
            onSelectWorker={(worker) => {
              setSelectedWorkerForEval({ id: worker.id, name: worker.name });
              setActiveTab('evaluation');
            }} 
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  // Renderizar la pantalla de login si no hay sesión iniciada
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      <Header />
      
      <main className="max-w-[1800px] mx-auto px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navegación Vertical */}
          <div className="lg:col-span-1">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}