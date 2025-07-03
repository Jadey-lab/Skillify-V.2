import React from 'react';
import Button from '@mui/material/Button';
import { getAuth, signOut } from 'firebase/auth';

export default function NWUSASStaffPortal() {
  const auth = getAuth();

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>NWU SAS Staff Portal</h1>
      <p>Welcome to the NWU SAS staff portal.</p>
      <Button variant="contained" color="secondary" onClick={handleSignOut}>
        Log Out
      </Button>
    </div>
  );
}
