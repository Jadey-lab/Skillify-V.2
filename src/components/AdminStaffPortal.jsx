import React, { useState } from 'react';
import { Tabs, Tab, Box, Button } from '@mui/material';
import NWUSASStaffPortal from './NWUSASStaffPortal';
import WitsSASStaffPortal from './WitsSASStaffPortal';
import { getAuth, signOut } from 'firebase/auth';

export default function AdminStaffPortal() {
  const [tabIndex, setTabIndex] = useState(0);
  const auth = getAuth();

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <h1>Admin Staff Portal</h1>
      <Tabs value={tabIndex} onChange={handleChange} aria-label="Staff portal chapters">
        <Tab label="NWU SAS" />
        <Tab label="Wits SAS" />
      </Tabs>

      <Box sx={{ marginTop: 3 }}>
        {tabIndex === 0 && <NWUSASStaffPortal />}
        {tabIndex === 1 && <WitsSASStaffPortal />}
      </Box>

      <Box sx={{ marginTop: 4 }}>
        <Button variant="contained" color="secondary" onClick={handleSignOut}>
          Log Out
        </Button>
      </Box>
    </Box>
  );
}
