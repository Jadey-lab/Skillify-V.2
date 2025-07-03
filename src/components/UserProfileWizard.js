import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const steps = ['Personal', 'Contact', 'Education'];

const UserProfileWizard = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [defaultCountry, setDefaultCountry] = useState('us');
  const [profileData, setProfileData] = useState({
    firstName: '', 
    surname: '',
    mobile: '', // will hold the formatted phone number
    email: '',
    education: '',
    fieldOfStudy: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  // Detect default country from IP using ipapi.co.
  useEffect(() => {
    fetch('https://ipapi.co/json')
      .then((res) => res.json())
      .then((data) => {
        setDefaultCountry(
          data && data.country_code ? data.country_code.toLowerCase() : 'us'
        );
      })
      .catch(() => setDefaultCountry('us'));
  }, []);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Open dialog if firstName is missing.
          if (!data.firstName) {
            setOpen(true);
          }
        } else {
          setOpen(true);
        }
      }
    };
    checkUserProfile();
  }, [user, firestore]);

  // Handle change for text fields.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Basic regex for email validation.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // For simplicity, we consider the phone valid if a non-empty value exists
  // and it contains at least 7 digits (after removing non-digit characters).
  const isStepValid = () => {
    if (step === 0) {
      return profileData.firstName.trim() !== '' && profileData.surname.trim() !== '';
    } else if (step === 1) {
      const isValidPhone =
        profileData.mobile.trim() !== '' &&
        profileData.mobile.replace(/\D/g, '').length >= 7;
      const isValidEmail = emailPattern.test(profileData.email.trim());
      console.log("Validating Contact Step:", {
        mobile: profileData.mobile,
        isValidPhone,
        isValidEmail,
      });
      return isValidPhone && isValidEmail;
    } else if (step === 2) {
      return (
        profileData.education.trim() !== '' &&
        profileData.fieldOfStudy.trim() !== ''
      );
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep((prev) => prev + 1);
    } else {
      console.error("Step validation failed.");
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    // profileData.mobile already holds the formatted phone number from react-phone-input-2.
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, profileData, { merge: true });
      setOpen(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              value={profileData.firstName}
              onChange={handleChange}
            />
            <TextField
              label="Surname"
              name="surname"
              fullWidth
              value={profileData.surname}
              onChange={handleChange}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <div>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: 8 }}>
                Mobile Number
              </label>
              <PhoneInput
                country={defaultCountry}
                preferredCountries={['za']}  // Preferred: South Africa (+27)
                value={profileData.mobile}
                onChange={(phone) =>
                  setProfileData((prev) => ({ ...prev, mobile: phone }))
                }
                inputStyle={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '16px',
                }}
              />
            </div>
            <TextField
              label="Email ID"
              name="email"
              fullWidth
              value={profileData.email}
              onChange={handleChange}
              helperText="Enter a valid email address"
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Education"
              name="education"
              fullWidth
              value={profileData.education}
              onChange={handleChange}
            />
            <TextField
              label="Field of Study"
              name="fieldOfStudy"
              fullWidth
              value={profileData.fieldOfStudy}
              onChange={handleChange}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        disableEscapeKeyDown
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { overflow: 'hidden', borderRadius: 3 } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              height: { xs: 'auto', md: '100%' },
            }}
          >
            {/* Left Side - Full Background Image */}
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: '100%', md: '50%' },
                height: { xs: '250px', md: '100%' },
                minHeight: { xs: '250px', md: '650px' },
                position: 'relative',
                backgroundImage:
                  'url("https://images.pexels.com/photos/3186386/pexels-photo-3186386.jpeg?auto=compress&cs=tinysrgb&w=600")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              />
            </Box>

            {/* Right Side - Form */}
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: '100%', md: '50%' },
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                p: 4,
              }}
            >
              {/* Logo on top */}
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Box
                  component="img"
                  src="https://res.cloudinary.com/db7fyg4z1/image/upload/v1743188490/3_krar41.svg"
                  alt="Logo"
                  sx={{ maxWidth: '100%', height: { xs: '80px', md: '150px' } }}
                />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: '500', color: 'black', mb: 2, textAlign: 'center' }}
              >
                COMPLETE YOUR PROFILE
              </Typography>

              <Stepper activeStep={step} alternativeLabel sx={{ mb: 2 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent()}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                {step > 0 && (
                  <Button onClick={handleBack} variant="outlined" color="secondary">
                    Back
                  </Button>
                )}
                <Box sx={{ flex: 1 }} />
                {step < steps.length - 1 ? (
                  <Button onClick={handleNext} variant="contained" color="primary" disabled={!isStepValid()}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!isStepValid()}>
                    Save
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Confirmation Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Profile saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserProfileWizard;
