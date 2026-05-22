import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import ChangeStagePage from './pages/ChangeStagePage';
import OnboardingPage from './pages/OnboardingPage';
import ExpansesPage from './pages/ExpansesPage';
import QuizVisaPage from './pages/QuizVisaPage';
import QuizTravelPage from './pages/QuizTravelPage';
import PathPage from './pages/PathPage';
import SectionPage from './pages/SectionPage';
import LauraPage from './pages/LauraPage';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import ChoiceProgramPage from './pages/ChoiceProgramPage';
import SettingsPage from './pages/SettingsPage';

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
      <Route path="/path/expenses" element={<ExpansesPage />} />
      <Route path="/path/:section" element={<SectionPage />} />
      <Route path="/laura" element={<LauraPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/choice-program" element={<ChoiceProgramPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}