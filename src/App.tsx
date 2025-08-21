import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import TUDashboard from './components/TUDashboard';
import KoordinatorDashboard from './components/KoordinatorDashboard';
import StaffDashboard from './components/StaffDashboard';
import PublicTracker from './components/PublicTracker';
import Header from './components/Header';
import { User, Report, Task } from './types';
import { initializeData, getCurrentUser, setCurrentUser, clearCurrentUser } from './utils/storage';

function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isPublicTracker, setIsPublicTracker] = useState(false);

  useEffect(() => {
    initializeData();
    const user = getCurrentUser();
    setCurrentUserState(user);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
    setIsPublicTracker(false);
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUserState(null);
    setIsPublicTracker(false);
  };

  const handlePublicTracker = () => {
    setIsPublicTracker(true);
    setCurrentUserState(null);
  };

  const handleBackToLogin = () => {
    setIsPublicTracker(false);
  };

  if (isPublicTracker) {
    return <PublicTracker onBackToLogin={handleBackToLogin} />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onPublicTracker={handlePublicTracker} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} onLogout={handleLogout} onPublicTracker={handlePublicTracker} />
      <main className="container mx-auto px-4 py-6">
        {currentUser.role === 'Admin' && <AdminDashboard />}
        {currentUser.role === 'TU' && <TUDashboard />}
        {currentUser.role === 'Koordinator' && <KoordinatorDashboard />}
        {currentUser.role === 'Staff' && <StaffDashboard />}
      </main>
    </div>
  );
}

export default App;