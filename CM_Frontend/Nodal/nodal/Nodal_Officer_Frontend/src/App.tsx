import React from 'react';
import { NodalProvider, useStore } from './context/Store';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './views/Login';
import { SmartCategorisation } from './views/SmartCategorisation';
import { RedressalAssignment } from './views/RedressalAssignment';
import { SLACountdown } from './views/SLACountdown';
import { BatchResolution } from './views/BatchResolution';
import { PendencyMonitor } from './views/PendencyMonitor';
import { PoorRatingAppeals } from './views/PoorRatingAppeals';
import { RootCauseClusters } from './views/RootCauseClusters';
import { MonthlyReport } from './views/MonthlyReport';
import { CrossDeptTicket } from './views/CrossDeptTicket';
import { PolicyRecommendation } from './views/PolicyRecommendation';
import { DirectMessages } from './views/DirectMessages';
import { VideoCall } from './views/VideoCall';
import { CallProvider } from './context/CallContext';

const DashboardContent: React.FC = () => {
  const { currentUser, activeTab } = useStore();
  if (!currentUser) return <Login />;

  const view = () => {
    switch (activeTab) {
      case 'SmartCategorisation':  return <SmartCategorisation />;
      case 'RedressalAssignment':  return <RedressalAssignment />;
      case 'SLACountdown':         return <SLACountdown />;
      case 'BatchResolution':      return <BatchResolution />;
      case 'PendencyMonitor':      return <PendencyMonitor />;
      case 'PoorRatingAppeals':    return <PoorRatingAppeals />;
      case 'RootCauseClusters':    return <RootCauseClusters />;
      case 'MonthlyReport':        return <MonthlyReport />;
      case 'CrossDeptTicket':      return <CrossDeptTicket />;
      case 'PolicyRecommendation': return <PolicyRecommendation />;
      case 'DirectMessages':       return <DirectMessages />;
      case 'VideoCall':            return <VideoCall />;
      default:                     return <SmartCategorisation />;
    }
  };

  return <MainLayout>{view()}</MainLayout>;
};

function App() {
  return (
    <NodalProvider>
      <CallProvider>
        <DashboardContent />
      </CallProvider>
    </NodalProvider>
  );
}

export default App;
