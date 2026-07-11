import { Routes, Route, useLocation, type Location } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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
import ChangePasswordPage from './pages/ChangePasswordPage';
import ChangeEmailPage from './pages/ChangeEmailPage';
import VerifyCodePage from './pages/VerifyCodePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
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
import RelocationOverviewPage from './pages/RelocationOverviewPage';
import TravelRoutesPage from './pages/TravelRoutesPage';
import AfterArrivalPage from './pages/AfterArrivalPage';
import CodiceFiscalePage from './pages/CodiceFiscalePage';
import PermessoPage from './pages/PermessoPage';
import LociRoutesView from './pages/LociRoutesView';
import ParmaLifeOverviewPage from './pages/ParmaLifeOverviewPage';
import ParmaSubsectionPage from './pages/ParmaSubsectionPage';

function AppRoutes({ location }: { location?: Location }) {
  return (
    <Routes location={location}>
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
      <Route path="/path/travel" element={<RelocationOverviewPage />} />
      <Route path="/path/travel/routes" element={<TravelRoutesPage />} />
      <Route path="/path/travel/after" element={<AfterArrivalPage />} />
      <Route path="/path/travel/codice-fiscale" element={<CodiceFiscalePage />} />
      <Route path="/path/travel/permesso" element={<PermessoPage />} />
      <Route path="/path/parma" element={<ParmaLifeOverviewPage />} />
      <Route path="/path/parma/:subsection" element={<ParmaSubsectionPage />} />
      <Route path="/loci/routes" element={<LociRoutesView />} />
      <Route path="/path/:section" element={<SectionPage />} />
      <Route path="/laura" element={<LauraPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/choice-program" element={<ChoiceProgramPage />} />
      <Route path="/change-course" element={<ChangeCoursePage />} />
      <Route path="/course/:id" element={<CoursePage />} />
      <Route path="/scholarship" element={<ScholarshipPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/change-password" element={<ChangePasswordPage />} />
      <Route path="/settings/change-email" element={<ChangeEmailPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

// Кросс-фейд только для welcome → вход/регистрация: старая страница
// растворяется поверх новой (обе на одинаковом фоне navy→cream, поэтому
// «синий экран» не появляется — меняется только контент). Остальные
// переходы — мгновенно, как раньше.
export default function App() {
  const location = useLocation();
  const prevRef = useRef(location);
  const [outgoing, setOutgoing] = useState<{ loc: Location; kind: 'login' | 'register' } | null>(
    null,
  );

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = location;
    if (prev.pathname === location.pathname) return;
    const kind =
      location.pathname === '/login' ? 'login' : location.pathname === '/register' ? 'register' : null;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prev.pathname === '/' && kind && !reduce) {
      setOutgoing({ loc: prev, kind });
    }
  }, [location]);

  return (
    <div style={{ position: 'relative', overflow: outgoing ? 'hidden' : undefined }}>
      <div className={outgoing ? `pt-in-${outgoing.kind}` : undefined}>
        <AppRoutes location={location} />
      </div>
      {outgoing && (
        <div
          className={`pt-out-${outgoing.kind} pointer-events-none`}
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
          onAnimationEnd={() => setOutgoing(null)}
        >
          <AppRoutes location={outgoing.loc} />
        </div>
      )}
    </div>
  );
}