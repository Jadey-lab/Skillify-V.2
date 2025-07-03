import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';  // Mentor Icon
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'; 
import FolderIcon from '@mui/icons-material/Folder'; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Icon for User Profile
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import './App.css';  // Import the CSS file


const NAVIGATION = [
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment:"trending",
    title:'Trending',
    icon: <TrendingUpIcon />, 
  },
  {
    segment: 'mentors',
    title: 'Mentors',
    icon: <PeopleIcon />,  // Mentor Icon
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Resources',
    sx: { textAlign: 'left' }, 
  },
  {
    segment: 'resources',
    title: 'Resources',
    icon: < FolderIcon />, 
  },
  {
    segment: 'Pubmedsearch',
    title: 'Pubmed',
    icon: <LibraryBooksIcon />, 
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Profile',
    sx: { textAlign: 'left' }, 
  },

 
  {
    segment: 'user-profile',
    title: 'User Profile',
    icon: <AccountCircleIcon />,  // Icon for User Profile
  },
  

 
];

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

function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutBranding(props) {
  const { window } = props;

  const router = useDemoRouter('/dashboard');

  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // preview-start
    <AppProvider
      navigation={NAVIGATION}
      branding={{
        logo: (
          <div className="mentor-logo">
            {/* Add your logo here */}
          </div>
        ),
        title: 'CAREER PORTAL',
        sx: { color:"black" }, 
        homeUrl: '/dashboard',
      }}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}

DashboardLayoutBranding.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutBranding;
