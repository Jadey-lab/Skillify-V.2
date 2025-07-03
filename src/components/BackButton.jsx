import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate('/dashboard')}
      style={{
        marginBottom: 20,
        textTransform: 'none',
        fontWeight: 'bold',
      }}
    >
      Back to Dashboard
    </Button>
  );
};

export default BackButton;
