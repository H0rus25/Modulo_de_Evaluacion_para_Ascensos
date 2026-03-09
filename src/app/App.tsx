import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { EvaluationForm } from './components/EvaluationForm';
import { WorkersList } from './components/WorkersList';
import { ResultsAnalysis } from './components/ResultsAnalysis';
import { DocumentManagement } from './components/DocumentManagement';
import { EmployeeDataEntry } from './components/EmployeeDataEntry';
import { TabNavigation } from './components/TabNavigation';
import { Footer } from './components/Footer';

export default function App() {
  const [selectedPosition, setSelectedPosition] = useState('Consultor Senior');
  const [activeTab, setActiveTab] = useState('employees');

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <WorkersList />;
      
      case 'entry':
        return <EmployeeDataEntry />;
      
      case 'documents':
        return <DocumentManagement />;
      
      case 'evaluation':
        return (
          <EvaluationForm 
            selectedPosition={selectedPosition}
            onPositionChange={setSelectedPosition}
          />
        );
      
      case 'results':
        return <ResultsAnalysis />;
      
      default:
        return <WorkersList />;
    }
  };

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}