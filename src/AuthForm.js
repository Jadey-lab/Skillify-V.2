import React, { useState } from 'react';
import {
  Button,
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  TextField,
  Link,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

// Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB-wNAvNipBAcf6RehRuyLGsgE1ajVNdss',
  authDomain: 'shadow-a-scientist.firebaseapp.com',
  projectId: 'shadow-a-scientist',
  storageBucket: 'shadow-a-scientist.appspot.com',
  messagingSenderId: '323474486768',
  appId: '1:323474486768:web:ff1125708832539c88d935',
  measurementId: 'G-JNW44K0YN3',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const AuthForm = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (isRegistering) {
      try {
        // Create a new user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save the default role as "Student" in Firestore
        await setDoc(doc(db, 'users', user.uid), { role: 'Student' });

        alert('Registration successful!');
        navigate('/AdminDashboardLayout'); // Use navigate for smooth routing
      } catch (error) {
        alert(error.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set the user in the parent component
        setUser(user);

        // Redirect to the appropriate dashboard
        navigate('/Dashboard'); // Use navigate for smooth routing
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      alert('Enter your email to reset the password.');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => alert('Password reset link sent!'))
      .catch((error) => alert(error.message));
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Set the user in the parent component
      setUser(user);

      // Redirect to student dashboard after Google login
      navigate('/Dashboard'); // Use navigate for smooth routing
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Card>
        <Grid container>
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              image="https://images.pexels.com/photos/3825539/pexels-photo-3825539.jpeg"
              alt="login form"
              sx={{ height: '100%' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <Typography variant="h4" component="div" gutterBottom>
                  Shadow A Scientist
                  <h6 style={{ color: 'grey' }}>SKILLIFY Beta v2.5 - Desktop Version</h6>
                </Typography>

                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  {isRegistering ? 'Register your account' : 'Sign into your account'}
                </Typography>

                <form onSubmit={handleFormSubmit} style={{ width: '100%' }}>
                  <TextField
                    label="Email address"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    {isRegistering ? 'Register' : 'Login'}
                  </Button>
                </form>

                {!isRegistering && (
                  <Link href="#" variant="body2" sx={{ mt: 2 }} onClick={handleForgotPassword}>
                    Forgot password?
                  </Link>
                )}

                <Typography variant="body2" sx={{ mt: 2 }}>
                  {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                  <Link href="#" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? 'Sign in here' : 'Register here'}
                  </Link>
                </Typography>

                <Box sx={{ mt: 3, width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={
                      <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAzFBMVEVHcEz////////+/v77+/vx8fL9/f309fX+/v739/f////09PXOz8/5+vr8/P3////////29vf///////84qlf8wAdGiPX8/PzsUUTqQjQsqFLrSj3S3/w6g/TqPCs0gPQgpUf85+bv9P+63sL62Nb+8ef4ycbw+PJkunkeePP81HXwgGv0jhzc5/3o9efX7N5Fr19Uj/WQy562zPr2trL94KDzoJrzoJv80Gjyl5H94qgyh9v7xzihsSp+wYV1sE5ZtXBmmvUynoWKrvzKDGT6AAAAE3RSTlMAW+TTeBLcHLMt1WsKzfUznkBIxSDAuAAAAUZJREFUKJFtktligkAMRUFZxKVuDMOAggpu1apVu+/t//9TkxBU1PsySQ4hlyGadpTd0fWOrV2R3eqyWhe80j1RpYCc7pmcI2tyaZimQw6bOTMplU9hpKIofJSUmgwtTCYq9EFhqKIJ5lbGdGIRAGhUQLNX6wRLOA2Y8vdpuvfVOJtaOjhdhL56yYrjU8cGFsRSLc4/x+DPfxBiSZN6LMlXUYXzVghBT8/7pPkdxFX28yzEO8HYI8U9dlQudMZx3AeInWWe+SrExxrhCLTre3E+M3P7FXznLn887z53a2PwGbjBLLvUP2jcYUC/FYdOA9d1g22SbN1fbizT9bUxXA+QguB4G2GlfbIFqw1i0GCzKmzDDQ1LZgPQLKHk5rAJpmSj0ykH0jxArW4V79yqF1bMkEckjYvFrTWIy0btApFsx7m68Ff1D4OdMHbngtKsAAAAAElFTkSuQmCC"
                        alt="Google"
                        style={{ height: '20px' }}
                      />
                    }
                    onClick={handleGoogleSignIn}
                  >
                    Sign in with Google
                  </Button>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Link href="https://drive.google.com/file/d/1KGGexQM_neAbET7AmI8YbZ5t3ZB1ZgmV/view?usp=sharing" variant="body2">
                    Terms of use
                  </Link>
                  <Link href="https://drive.google.com/file/d/1VwTNFzZcnWEZtANgMUG582L9q1eZ_KOg/view?usp=sharing" variant="body2">
                    Privacy policy
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default AuthForm;
