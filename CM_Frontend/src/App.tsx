import React from 'react';
import { DashboardProvider, useStore } from './context/Store';
import { CallProvider } from './context/CallContext';
import { CallOverlay } from './components/CallOverlay';
import { getRoleLabel } from './utils/helper';
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
import { Comm } from './views/Comm';
import { VideoCall } from './views/VideoCall';
import { Login } from './views/Login';
import { KnowledgeGraph } from './views/KnowledgeGraph';
import { OfficerWorkspace } from './views/OfficerWorkspace';
import { DistrictMinistryDashboard } from './views/DistrictMinistryDashboard';
import LandingPage from './views/LandingPage';
import { CitizenDashboard } from './views/CitizenDashboard';
import UserApp from './views/citizen_portal/UserApp';
import { AuthProvider } from './views/citizen_portal/mockHelpers';

// Ported DM Views
import { ComplaintQueue } from './views/ComplaintQueue';
import { DMScorecard } from './views/DMScorecard';
import { DirectMessages as DMDirectMessages } from './views/DMDirectMessages';
import { EscalateSecretary } from './views/EscalateSecretary';
import { InterimReply } from './views/InterimReply';
import { NewComplaintIntake } from './views/NewComplaintIntake';
import { OfficerAssignment } from './views/OfficerAssignment';
import { RevenueCases } from './views/RevenueCases';
import { SDMLoadView } from './views/SDMLoadView';

// Ported Nodal Views
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
import { DirectMessages as NodalDirectMessages } from './views/NodalDirectMessages';


const DashboardContent: React.FC = () => {
  const { activeTab, currentUser } = useStore();
  const [showLogin, setShowLogin] = React.useState(false);
  const [portalView, setPortalView] = React.useState<'landing' | 'citizen'>('landing');

  if (!currentUser) {
    if (portalView === 'citizen') {
      return (
        <AuthProvider onLogout={() => setPortalView('landing')}>
          <UserApp />
        </AuthProvider>
      );
    }
    if (showLogin) {
      return <Login onBack={() => { setShowLogin(false); setPortalView('landing'); }} />;
    }
    return (
      <LandingPage
        onCitizen={() => {
          setPortalView('citizen');
        }}
        onAdmin={() => {
          setShowLogin(true);
        }}
      />
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'CitizenOverview':
        return <CitizenDashboard subTab="Overview" />;
      case 'CitizenComplaints':
        return <CitizenDashboard subTab="Complaints" />;
      case 'MilestonesDocuments':
        return <CitizenDashboard subTab="Milestones & Documents" />;
      case 'CitizenDistrictView':
        return <CitizenDashboard subTab="District View" />;
      case 'BoothAnalyser':
        return <CitizenDashboard subTab="Booth Analyser" />;
      case 'FundPredictor':
        return <CitizenDashboard subTab="Fund Predictor" />;
      case 'ManageAdmins':
        return <CitizenDashboard subTab="Manage Admins" />;
      case 'OfficerCsvImport':
        return <CitizenDashboard subTab="Officer CSV Import" />;
      case 'Analytics':
        return <Analytics />;
      case 'KnowledgeGraph':
        return <KnowledgeGraph />;
      case 'OfficerWorkspace':
        return <OfficerWorkspace />;
      case 'DistrictMinistry':
        return <DistrictMinistryDashboard />;
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
      case 'Communications':
        return <Comm />;
      case 'VideoCall':
        return <VideoCall />;

      // Ported DM View Routing
      case 'ComplaintQueue':
        return <ComplaintQueue />;
      case 'DMScorecard':
        return <DMScorecard />;
      case 'DMDirectMessages':
        return <DMDirectMessages />;
      case 'EscalateSecretary':
        return <EscalateSecretary />;
      case 'InterimReply':
        return <InterimReply />;
      case 'NewComplaintIntake':
        return <NewComplaintIntake />;
      case 'OfficerAssignment':
        return <OfficerAssignment />;
      case 'RevenueCases':
        return <RevenueCases />;
      case 'SDMLoadView':
        return <SDMLoadView />;

      // Ported Nodal View Routing
      case 'SmartCategorisation':
        return <SmartCategorisation />;
      case 'RedressalAssignment':
        return <RedressalAssignment />;
      case 'SLACountdown':
        return <SLACountdown />;
      case 'BatchResolution':
        return <BatchResolution />;
      case 'PendencyMonitor':
        return <PendencyMonitor />;
      case 'PoorRatingAppeals':
        return <PoorRatingAppeals />;
      case 'RootCauseClusters':
        return <RootCauseClusters />;
      case 'MonthlyReport':
        return <MonthlyReport />;
      case 'CrossDeptTicket':
        return <CrossDeptTicket />;
      case 'PolicyRecommendation':
        return <PolicyRecommendation />;
      case 'NodalDirectMessages':
        return <NodalDirectMessages />;

      default:
        return <Overview />;
    }
  };

  const roleLabel = getRoleLabel(currentUser);

  return (
    <CallProvider selfId={roleLabel} selfName={roleLabel}>
      <MainLayout>
        {renderActiveView()}
      </MainLayout>
      <CallOverlay />
    </CallProvider>
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
