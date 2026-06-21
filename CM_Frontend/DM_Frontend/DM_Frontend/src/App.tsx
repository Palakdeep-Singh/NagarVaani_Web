import React from 'react';
import { DMProvider, useStore } from './context/Store';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './views/Login';
import { ComplaintQueue } from './views/ComplaintQueue';
import { OfficerAssignment } from './views/OfficerAssignment';
import { EscalateSecretary } from './views/EscalateSecretary';
import { InterimReply } from './views/InterimReply';
import { RevenueCases } from './views/RevenueCases';
import { SDMLoadView } from './views/SDMLoadView';
import { DMScorecard } from './views/DMScorecard';
import { NewComplaintIntake } from './views/NewComplaintIntake';
import { KnowledgeGraph } from './views/KnowledgeGraph';
import { DirectMessages } from './views/DirectMessages';
import { VideoCall } from './views/VideoCall';
import { CallProvider } from './context/CallContext';

const DashboardContent: React.FC = () => {
  const { currentUser, activeTab } = useStore();
  if (!currentUser) return <Login />;

  const view = () => {
    switch (activeTab) {
      case 'ComplaintQueue':    return <ComplaintQueue />;
      case 'KnowledgeGraph':    return <KnowledgeGraph />;
      case 'OfficerAssignment': return <OfficerAssignment />;
      case 'EscalateSecretary': return <EscalateSecretary />;
      case 'InterimReply':      return <InterimReply />;
      case 'RevenueCases':      return <RevenueCases />;
      case 'SDMLoadView':       return <SDMLoadView />;
      case 'DMScorecard':       return <DMScorecard />;
      case 'NewComplaintIntake':return <NewComplaintIntake />;
      case 'DirectMessages':    return <DirectMessages />;
      case 'VideoCall':         return <VideoCall />;
      default:                  return <ComplaintQueue />;
    }
  };

  return <MainLayout>{view()}</MainLayout>;
};

function App() {
  return (
    <DMProvider>
      <CallProvider>
        <DashboardContent />
      </CallProvider>
    </DMProvider>
  );
}

export default App;
