import React from 'react';
import { DashboardProvider, useStore } from './context/Store';
import { MainLayout } from './layouts/MainLayout';
import { Overview } from './views/Overview';
import { Analytics } from './views/Analytics';
import { Rankings } from './views/Rankings';
import { Suggestions } from './views/Suggestions';
import { HealthDept } from './views/HealthDept';
import { EducationDept } from './views/EducationDept';
import { DMView } from './views/DMView';
import { Officers } from './views/Officers';
import { Projects } from './views/Projects';
import { Funds } from './views/Funds';
import { Files } from './views/Files';
import { Comm } from './views/Comm';
import { VideoCall } from './views/VideoCall';
import { Login } from './views/Login';

// Subcomponent to access store context
const DashboardContent: React.FC = () => {
  const { activeTab, currentUser } = useStore();

  if (!currentUser) {
    return <Login />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'Analytics':
        return <Analytics />;
      case 'Rankings':
        return <Rankings />;
      case 'Suggestions':
        return <Suggestions />;
      case 'Health':
        return <HealthDept />;
      case 'Education':
        return <EducationDept />;
      case 'DM View':
        return <DMView />;
      case 'Officers':
        return <Officers />;
      case 'Projects':
        return <Projects />;
      case 'Funds':
        return <Funds />;
      case 'Files':
        return <Files />;
      case 'Communications':
        return <Comm />;
      case 'VideoCall':
        return <VideoCall />;
      default:
        return <Overview />;
    }
  };

  return (
    <MainLayout>
      {renderActiveView()}
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
