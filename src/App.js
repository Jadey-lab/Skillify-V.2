import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import DashboardLayoutBranding from './components/Dashboard';



import AuthForm from './AuthForm';
import ChapterTabsGrid from './ChapterTabsGrid';

import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import HighlightsPage from './pages/HighlightsPage';
import ResourcesPage from './pages/ResourcesPage';



import './firebase';
import './App.css';
import Button from '@mui/material/Button';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const auth = getAuth();
  const location = useLocation(); // <-- get current path

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
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  // Define paths where you want the logout button to be visible
  const showLogoutButton =
    location.pathname === '/dashboard' || location.pathname === '/'; // Add more paths here if needed

  return (
    <div className="App">
      {user ? (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            {role === 'Student' && <Route path="/dashboard" element={<DashboardLayoutBranding />} />}

            <Route path="/chapters" element={<ChapterTabsGrid />} />
            <Route path="/chapter/:chapterId/events" element={<EventsPage />} />
            <Route path="/chapter/:chapterId/gallery" element={<GalleryPage />} />
            <Route path="/chapter/:chapterId/highlights" element={<HighlightsPage />} />
            <Route path="/chapter/:chapterId/resources" element={<ResourcesPage />} />
           
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>

          {/* Conditionally render the logout button only on dashboard page */}
          {showLogoutButton && (
            <div className="logout-button-container">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSignOut}
                style={{ position: 'absolute', left: '20px' }}
              >
                Log Out
              </Button>
            </div>
          )}
        </>
      ) : (
        <Routes>
          <Route path="*" element={<AuthForm setUser={setUser} />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
