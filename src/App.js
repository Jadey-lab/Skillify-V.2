import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import DashboardLayoutBranding from './Dashboard';
import AuthForm from './AuthForm';
import ChapterTabsGrid from './ChapterTabsGrid';

import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import HighlightsPage from './pages/HighlightsPage';
import ResourcesPage from './pages/ResourcesPage';



import './firebase';
import './App.css';

import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const tokenResult = await currentUser.getIdTokenResult(true);
          const userRole = tokenResult.claims.role || 'Student';
          setRole(userRole);
        } catch (err) {
          console.error('Error fetching user claims:', err);
          setRole('Student');
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setRole(null);
        navigate('/auth');  // Redirect to AuthForm after logout
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  // Show logout button on these routes — add more routes if needed
  const showLogoutButton =
    location.pathname === '/dashboard' ||
    location.pathname === '/' ||
    location.pathname === '/mentorconnect';  // Added /mentorconnect here

  return (
    <div className="App">
      {user ? (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {role === 'Student' && (
              <>
                <Route path="/dashboard" element={<DashboardLayoutBranding />} />
           
              </>
            )}

            <Route path="/chapters" element={<ChapterTabsGrid />} />
            <Route path="/chapter/:chapterId/events" element={<EventsPage />} />
            <Route path="/chapter/:chapterId/gallery" element={<GalleryPage />} />
            <Route path="/chapter/:chapterId/highlights" element={<HighlightsPage />} />
            <Route path="/chapter/:chapterId/resources" element={<ResourcesPage />} />

            {/* Fallback for any other route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>

          {showLogoutButton && (
            <div className="logout-button-container" style={{ position: 'absolute', left: '20px' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSignOut}
                startIcon={<LogoutIcon />}
              >
                Log Out
              </Button>
            </div>
          )}
        </>
      ) : (
        <Routes>
          {/* AuthForm route */}
          <Route path="/auth" element={<AuthForm setUser={setUser} />} />
          {/* Redirect anything else to auth */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
