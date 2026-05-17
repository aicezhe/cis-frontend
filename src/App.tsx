import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import PathPage from './pages/PathPage';
import SectionPage from './pages/SectionPage';
import LauraPage from './pages/LauraPage';
import MapPage from './pages/MapPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/path" element={<PathPage />} />
      <Route path="/path/:section" element={<SectionPage />} />
      <Route path="/laura" element={<LauraPage />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}
