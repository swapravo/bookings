import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { SignupPage } from '@/pages/SignupPage';
import { LoginPage } from '@/pages/LoginPage';
import { UsernamePage } from '@/pages/UsernamePage';
import { OnboardingAvailability } from '@/pages/OnboardingAvailability';
import { OnboardingDone } from '@/pages/OnboardingDone';
import { DashboardLayout } from '@/pages/dashboard/DashboardLayout';
import { HomePage } from '@/pages/dashboard/HomePage';
import { AvailabilityPage } from '@/pages/dashboard/AvailabilityPage';
import { BookingsPage } from '@/pages/dashboard/BookingsPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { PublicBookingPage } from '@/pages/PublicBookingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding/username" element={<UsernamePage />} />
      <Route path="/onboarding/availability" element={<OnboardingAvailability />} />
      <Route path="/onboarding/done" element={<OnboardingDone />} />
      <Route path="/app" element={<DashboardLayout><HomePage /></DashboardLayout>} />
      <Route path="/app/availability" element={<DashboardLayout><AvailabilityPage /></DashboardLayout>} />
      <Route path="/app/bookings" element={<DashboardLayout><BookingsPage /></DashboardLayout>} />
      <Route path="/app/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
      <Route path="/:username" element={<PublicBookingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
