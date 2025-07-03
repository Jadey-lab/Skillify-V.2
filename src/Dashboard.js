import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import BiotechIcon from '@mui/icons-material/Biotech';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import LanguageIcon from '@mui/icons-material/Language';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import ClassIcon from '@mui/icons-material/Class';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BadgeIcon from '@mui/icons-material/Badge';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CollectionsIcon from '@mui/icons-material/Collections';

// Toolpad
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

// Firebase
import { getAuth, signOut } from 'firebase/auth';
import './firebase';

// Assets
import logo from './public/logo.png';
import './index.css';

// Components
import PubMedSearch from './components/PubMedSearch';
import StudyPlanner from './components/StudyPlanner';
import Quiz from './components/Quiz';
import MentorsPage from './components/MentorsPage';
import MentorsDashboard from './components/MentorsDashboard';
import RssFeed from './components/RssFeed';
import EventsPage from './components/EventsPage';
import Admin from './components/Admin';
import InternationalJobs from './components/InternationalJobs';
import LocalJobs from './components/LocalJobs';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import MyEvents from './components/MyEvents';
import UserProfileWizard from './components/UserProfileWizard';
import Schedule from './components/Schedule';


// Firebase authentication setup
const auth = getAuth();

// Navigation structure
const NAVIGATION = [
  {
    kind: 'header',
    title: 'Shadow A Scientist',
  },
  {
    segment: 'admin',
    title: 'Admin',
    icon: <SupervisorAccountIcon />,
  },

  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'mentors',
    title: 'Mentors',
    icon: <PeopleIcon />,
    children: [
      {
        segment: 'mentorsPage',
        title: 'Mentors',
        icon: <SchoolIcon />,
      },
      {
        segment: 'mentorsdashboard',
        title: 'MentorsDashboard',
        icon: <SupervisedUserCircleIcon />,
      },
    
    ],
  },
  {
    segment: 'localjobs',
    title: 'Local Jobs',
    icon: <GpsFixedIcon />,
  },
  {
    segment: 'internationaljobs',
    title: 'International Jobs',
    icon: <LanguageIcon />,
  },
  {
    segment: 'events',
    title: 'Events',
    icon: <EventIcon />,
  },
  {
    segment: 'myevents',
    title: 'MyEvents',
    icon: <BookOnlineIcon />,
  },
  
 
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Resources',
  },
  {
    segment: 'quiz',
    title: 'Quiz',
    icon: <SportsEsportsIcon />,
  },
  {
    segment: 'StudyPlanner',
    title: 'StudyHub',
    icon: <AutoStoriesIcon />,
  },
  {
    segment:'Schedule',
    title: 'Schedule (Desktop version)',
    icon: <EditCalendarIcon />,
  }, 
  
  {
    segment: 'Pubmed',
    title: 'Pubmed',
    icon: <BiotechIcon />,
  },


  

  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Profile settings',
  },
  {
    segment: 'UserProfile',
    title: 'User Profile',
    icon: <AccountCircleIcon />,
  },
  
];

// Custom theme
const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Page content renderer
function DemoPageContent({ pathname }) {
  const decodedPathname = decodeURIComponent(pathname);

  const pathMapping = {
    '/quiz': <Quiz />,
    '/Pubmed': <PubMedSearch />,
    
    '/mentors': <MentorsPage />,
    '/trending': <RssFeed />,
    '/events': <EventsPage />,
    '/internationaljobs': <InternationalJobs />,
    '/localjobs': <LocalJobs />,
    '/dashboard': <Dashboard />,
    '/UserProfile': <UserProfile />,
    '/StudyPlanner': <StudyPlanner />,
    '/myevents': <MyEvents />,
    '/admin': <Admin />,

    '/Schedule': <Schedule/>,
    '/mentors/mentorsPage': <MentorsPage />,
    '/mentors/mentorsdashboard': <MentorsDashboard />,
    
  
  };

  const currentPage = pathMapping[decodedPathname];

  return (
    currentPage || (
      <Box
        sx={{
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography>Dashboard content for {decodedPathname}</Typography>
      </Box>
    )
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

// Main layout
function DashboardLayoutBasic(props) {
  const { window } = props;
  const router = useDemoRouter('/dashboard');
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      navigation={NAVIGATION}
      branding={{
        logo: (
          <div className="mentor-logo">
            <img
              src={logo}
              alt="Logo"
              style={{
                width: '300px',
                height: 'auto',
                maxHeight: 'none',
                maxWidth: 'none',
                marginTop: '-63px',
              }}
            />
          </div>
        ),
        title: <span className="career-portal-title"></span>,
        homeUrl: '/dashboard',
      }}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      {/* The UserProfileWizard is rendered here without affecting existing functionality */}
      <UserProfileWizard />
      <DashboardLayout>
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutBasic.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutBasic;
