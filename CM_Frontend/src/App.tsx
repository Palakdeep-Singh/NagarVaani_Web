import React from 'react';
import { DashboardProvider, useStore } from './context/Store';
import { MainLayout } from './layouts/MainLayout';
import { Overview } from './views/Overview';
import { Departments } from './views/Departments';
import { DMView } from './views/DMView';
import { Projects } from './views/Projects';
import { Files } from './views/Files';
import { Comm } from './views/Comm';
import { Officers } from './views/Officers';
import { Chatbot } from './components/Chatbot';

// Subcomponent to access store context
const DashboardContent: React.FC = () => {
  const { activeTab } = useStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'Departments':
        return <Departments />;
      case 'DM View':
        return <DMView />;
      case 'Files':
        return <Files />;
      case 'Projects':
        return <Projects />;
      case 'Communications':
        return <Comm />;
      case 'Officers':
        return <Officers />;
      default:
        return <Overview />;
    }
  };

  return (
    <MainLayout>
      {renderActiveView()}
      <Chatbot />
    </MainLayout>
  );
};

function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default App;
