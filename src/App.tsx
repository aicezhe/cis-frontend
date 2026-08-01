import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageTransition } from './components/PageTransition';
import { LoadingScreen } from './components/Loader';
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import ChangeStagePage from './pages/ChangeStagePage';
import OnboardingPage from './pages/OnboardingPage';
import QuizVisaPage from './pages/QuizVisaPage';
import QuizTravelPage from './pages/QuizTravelPage';
import PathPage from './pages/PathPage';
import SectionPage from './pages/SectionPage';
import LauraPage from './pages/LauraPage';
import LoginPage from './pages/LoginPage';
import ChoiceProgramPage from './pages/ChoiceProgramPage';
import ChangeCoursePage from './pages/ChangeCoursePage';
import CoursePage from './pages/CoursePage';
import ScholarshipPage from './pages/ScholarshipPage';
import SettingsPage from './pages/SettingsPage';
import MemoryPage from './pages/MemoryPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ChangeEmailPage from './pages/ChangeEmailPage';
import VerifyCodePage from './pages/VerifyCodePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ExpensesPage from './pages/ExpensesPage';
import FoundationOverviewPage from './pages/FoundationOverviewPage';
import FoundationStructurePage from './pages/FoundationStructurePage';
import FoundationFinancePage from './pages/FoundationFinancePage';
import FoundationLanguagesPage from './pages/FoundationLanguagesPage';
import ProgramOverviewPage from './pages/ProgramOverviewPage';
import ProgramStructurePage from './pages/ProgramStructurePage';
import ProgramDocumentsPage from './pages/ProgramDocumentsPage';
import ProgramDiplomaPage from './pages/ProgramDiplomaPage';
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
import HousingSearchPage from './pages/HousingSearchPage';
import CardsPage from './pages/CardsPage';
import SsnTesseraPage from './pages/SsnTesseraPage';
import KzSimPage from './pages/KzSimPage';
import KzCardsPage from './pages/KzCardsPage';
import ParmaLifeOverviewPage from './pages/ParmaLifeOverviewPage';
import ParmaGroupPage from './pages/ParmaGroupPage';
import ParmaSubsectionPage from './pages/ParmaSubsectionPage';

// MapLibre GL — тяжёлая либа (~500 KB gzip), нужна только на /map. Ленивая
// загрузка, чтобы не тащить её в общий бандл для всех остальных страниц.
const MapPage = lazy(() => import('./pages/MapPage'));

function MapPageFallback() {
  return <LoadingScreen />;
}

export default function App() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-stage" element={<ChangeStagePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/quiz-visa" element={<QuizVisaPage />} />
        <Route path="/quiz-travel" element={<QuizTravelPage />} />
        <Route path="/path" element={<PathPage />} />
        <Route path="/path/expenses" element={<ExpensesPage />} />
        <Route path="/path/foundation" element={<FoundationOverviewPage />} />
        <Route path="/path/foundation/structure" element={<FoundationStructurePage />} />
        <Route path="/path/foundation/finance" element={<FoundationFinancePage />} />
        <Route path="/path/foundation/languages" element={<FoundationLanguagesPage />} />
        <Route path="/path/uni/program" element={<ProgramOverviewPage />} />
        <Route path="/path/uni/program/structure" element={<ProgramStructurePage />} />
        <Route path="/path/uni/program/documents" element={<ProgramDocumentsPage />} />
        <Route path="/path/uni/program/diploma" element={<ProgramDiplomaPage />} />
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
        <Route path="/path/travel/housing" element={<HousingSearchPage />} />
        <Route path="/path/travel/cards" element={<CardsPage />} />
        <Route path="/path/travel/ssn" element={<SsnTesseraPage />} />
        <Route path="/path/travel/kz-sim" element={<KzSimPage />} />
        <Route path="/path/travel/kz-cards" element={<KzCardsPage />} />
        <Route path="/path/parma" element={<ParmaLifeOverviewPage />} />
        <Route path="/path/parma/group/:groupId" element={<ParmaGroupPage />} />
        <Route path="/path/parma/:subsection" element={<ParmaSubsectionPage />} />
        <Route path="/path/:section" element={<SectionPage />} />
        <Route path="/laura" element={<LauraPage />} />
        <Route
          path="/map"
          element={
            <Suspense fallback={<MapPageFallback />}>
              <MapPage />
            </Suspense>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/choice-program" element={<ChoiceProgramPage />} />
        <Route path="/change-course" element={<ChangeCoursePage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/scholarship" element={<ScholarshipPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/change-password" element={<ChangePasswordPage />} />
        <Route path="/settings/change-email" element={<ChangeEmailPage />} />
        <Route path="/settings/memory" element={<MemoryPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </PageTransition>
  );
}
