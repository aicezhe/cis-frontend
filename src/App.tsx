import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import ChangeStagePage from './pages/ChangeStagePage';
import OnboardingPage from './pages/OnboardingPage';
import QuizVisaPage from './pages/QuizVisaPage';
import QuizTravelPage from './pages/QuizTravelPage';
import PathPage from './pages/PathPage';
import SectionPage from './pages/SectionPage';
import LauraPage from './pages/LauraPage';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import ChoiceProgramPage from './pages/ChoiceProgramPage';
import ChangeCoursePage from './pages/ChangeCoursePage';
import CoursePage from './pages/CoursePage';
import ScholarshipPage from './pages/ScholarshipPage';
import SettingsPage from './pages/SettingsPage';
import FoundationOverviewPage from './pages/FoundationOverviewPage';
import ProgramOverviewPage from './pages/ProgramOverviewPage';
import ProgramStepsPage from './pages/ProgramStepsPage';
import ProgramDocumentsPage from './pages/ProgramDocumentsPage';
import ProgramFinancePage from './pages/ProgramFinancePage';
import ProgramLanguagesPage from './pages/ProgramLanguagesPage';
import NumeroChiusoPage from './pages/NumeroChiusoPage';
import IseeDocumentsPage from './pages/IseeDocumentsPage';
import VisaOverviewPage from './pages/VisaOverviewPage';
import VisaStepsPage from './pages/VisaStepsPage';
import VisaRejectionsPage from './pages/VisaRejectionsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/change-stage" element={<ChangeStagePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/quiz-visa" element={<QuizVisaPage />} />
      <Route path="/quiz-travel" element={<QuizTravelPage />} />
      <Route path="/path" element={<PathPage />} />
      <Route path="/path/foundation" element={<FoundationOverviewPage />} />
      <Route path="/path/uni/program" element={<ProgramOverviewPage />} />
      <Route path="/path/uni/program/steps" element={<ProgramStepsPage />} />
      <Route path="/path/uni/program/documents" element={<ProgramDocumentsPage />} />
      <Route path="/path/uni/program/finance" element={<ProgramFinancePage />} />
      <Route path="/path/uni/program/languages" element={<ProgramLanguagesPage />} />
      <Route path="/path/uni/program/numero-chiuso" element={<NumeroChiusoPage />} />
      <Route path="/path/uni/program/isee" element={<IseeDocumentsPage />} />
      <Route path="/path/parma/isee" element={<IseeDocumentsPage />} />
      <Route path="/path/visa" element={<VisaOverviewPage />} />
      <Route path="/path/visa/steps" element={<VisaStepsPage />} />
      <Route path="/path/visa/rejections" element={<VisaRejectionsPage />} />
      <Route path="/path/:section" element={<SectionPage />} />
      <Route path="/laura" element={<LauraPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/choice-program" element={<ChoiceProgramPage />} />
      <Route path="/change-course" element={<ChangeCoursePage />} />
      <Route path="/course/:id" element={<CoursePage />} />
      <Route path="/scholarship" element={<ScholarshipPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}