import React, { useState, useEffect, useMemo, useRef } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Container,
  Grid,
  Paper,
  Button,
  Typography,
  TextField,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import TrackChangesSharpIcon from "@mui/icons-material/TrackChangesSharp";
import Draggable from "react-draggable"; // For draggable overlays


// Firebase imports
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// React Calendar imports
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


const firebaseConfig = {
  apiKey: "AIzaSyB-wNAvNipBAcf6RehRuyLGsgE1ajVNdss",
  authDomain: "shadow-a-scientist.firebaseapp.com",
  projectId: "shadow-a-scientist",
  storageBucket: "shadow-a-scientist.appspot.com",
  messagingSenderId: "323474486768",
  appId: "1:323474486768:web:ff1125708832539c88d935",
  measurementId: "G-JNW44K0YN3",
};

// Initialize Firebase, Firestore, and Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Pomodoro durations in seconds
const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

// Pre-defined mapping of subjects to YouTube video suggestions.
const videoSuggestionsMapping = {
  "microbiology unit 1": [
    {
      title: "Introduction to Microbiology",
      videoId: "3wP9YEF-R7I",
    },
    {
      title: "Basics of Microbiology",
      videoId: "XxWQ8M-C3s8",
    },
  ],
  // Add more subjects and video suggestions here.
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#ffff",
      paper: "#121212",
    },
    text: {
      primary: "#fff",
    },
  },
});



const StudyPlanner = () => {
  // Timer & session state
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsRemaining, setSessionsRemaining] = useState(0);
  const [studyGoal, setStudyGoal] = useState("");

  // State for study topic (subject) input
  const [studyTopic, setStudyTopic] = useState("");

  // User-related state
  const [userId, setUserId] = useState(null); // Authenticated user ID
  const [studyDays, setStudyDays] = useState([]); // Logged study days (YYYY-MM-DD strings)
  const [studySessions, setStudySessions] = useState([]); // Array of study session data

  // YouTube Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // Replace with your actual YouTube API key
  const YOUTUBE_API_KEY = "AIzaSyANGvZz0r7W_veVjMZOM9E2rEB_5899yVo";

  // State for menu and overlays
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const [showBackgroundMusic, setShowBackgroundMusic] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Popup state for Snackbar messages
  const [popup, setPopup] = useState({ open: false, message: "" });

  // Create refs for each draggable overlay

  const backgroundMusicRef = useRef(null);
  const notesRef = useRef(null);

  // Audio references for sounds.
  const breakSoundRef = useRef(new Audio("/sounds/break.mp3"));
  const sessionEndSoundRef = useRef(new Audio("/sounds/session_end.mp3"));
  const sessionStartSoundRef = useRef(new Audio("/sounds/session_start.mp3"));
  const breakOverSoundRef = useRef(new Audio("/sounds/break over.mp3"));

  // Helper function to show pop-up messages.
  const showPopup = (message) => {
    setPopup({ open: true, message });
  };

  // Menu handlers
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Listen for authentication state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch study days (for calendar tracker).
  useEffect(() => {
    if (userId) {
      const studyDaysCollection = collection(db, "userprogress", userId, "studyDays");
      const unsubscribe = onSnapshot(
        studyDaysCollection,
        (snapshot) => {
          const days = snapshot.docs.map((doc) => doc.id);
          setStudyDays(days);
        },
        (error) => console.error("Error fetching study days:", error)
      );
      return () => unsubscribe();
    }
  }, [userId]);

  // Fetch study sessions (for progress dashboard).
  useEffect(() => {
    if (userId) {
      const sessionsCollection = collection(db, "userprogress", userId, "studySessions");
      const unsubscribe = onSnapshot(
        sessionsCollection,
        (snapshot) => {
          const sessionsData = snapshot.docs.map((doc) => doc.data());
          setStudySessions(sessionsData);
        },
        (error) => console.error("Error fetching study sessions:", error)
      );
      return () => unsubscribe();
    }
  }, [userId]);

  // Log the current day when a session starts.
  const logStudyDay = async () => {
    if (!userId) return;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    try {
      await setDoc(doc(db, "userprogress", userId, "studyDays", todayStr), {
        studyDate: today,
      });
      setStudyDays((prevDays) =>
        prevDays.includes(todayStr) ? prevDays : [...prevDays, todayStr]
      );
    } catch (error) {
      console.error("Error logging study day:", error);
    }
  };

  // Calculate the current study streak.
  const calculateStreak = () => {
    if (!studyDays || studyDays.length === 0) return 0;
    const daySet = new Set(studyDays);
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize to midnight

    const formatDate = (date) => date.toISOString().split("T")[0];
    while (daySet.has(formatDate(currentDate))) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  // Recalculate sessions based on study goal (2 Pomodoro sessions per hour).
  const recalcSessions = (hours) => {
    const hrs = Number(hours) || 0;
    const totalSessions = hrs > 0 ? hrs * 2 : 0;
    setSessionsTotal(totalSessions);
    setSessionsRemaining(totalSessions);
    setIsBreak(false);
    setTimeLeft(WORK_DURATION);
  };

  // Record a study session in Firestore.
  const recordStudySession = async (duration) => {
    if (!userId) {
      alert("You must be logged in to track study sessions.");
      return;
    }
    try {
      await addDoc(collection(db, "userprogress", userId, "studySessions"), {
        timestamp: new Date(),
        duration, // in seconds
      });
      console.log("Study session recorded for user:", userId);
    } catch (error) {
      console.error("Error recording study session:", error);
    }
  };

  // Timer countdown effect.
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      if (!isBreak) {
        recordStudySession(WORK_DURATION);
        if (sessionsRemaining > 1) {
          setSessionsRemaining((prev) => prev - 1);
          setIsBreak(true);
          setTimeLeft(BREAK_DURATION);
          // Play break sound and show pop-up when switching to break.
          breakSoundRef.current
            .play()
            .catch((error) => console.error("Error playing break sound:", error));
          showPopup("Break started");
        } else {
          setSessionsRemaining(0);
          setIsRunning(false);
          // Play session end sound and show pop-up when all sessions complete.
          sessionEndSoundRef.current
            .play()
            .catch((error) => console.error("Error playing session end sound:", error));
          showPopup("All Pomodoro sessions completed. Great job!");
        }
      } else {
        setIsBreak(false);
        setTimeLeft(WORK_DURATION);
        // Play break over sound and show pop-up when break ends.
        breakOverSoundRef.current
          .play()
          .catch((error) => console.error("Error playing break over sound:", error));
        showPopup("Break is over. Back to work!");
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, sessionsRemaining]);

  // Start timer (and log study day). Play session start sound and show pop-up.
  const startTimer = () => {
    if (sessionsTotal > 0) {
      sessionStartSoundRef.current
        .play()
        .catch((error) =>
          console.error("Error playing session start sound:", error)
        );
      showPopup("Session started");
      logStudyDay();
      setIsRunning(true);
    } else {
      alert("Please set a study goal in hours.");
    }
  };

  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSessionsRemaining(sessionsTotal);
    setTimeLeft(WORK_DURATION);
  };

  const handleStudyGoalChange = (e) => {
    const value = e.target.value;
    setStudyGoal(value);
    recalcSessions(value);
  };

  const handleStudyTopicChange = (e) => {
    setStudyTopic(e.target.value);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  // --- Progress Dashboard Calculations ---
  const totalSessionsCount = studySessions.length;
  const totalStudySeconds = studySessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0
  );
  const totalStudyMinutes = Math.floor(totalStudySeconds / 60);
  const totalStudyHours = (totalStudySeconds / 3600).toFixed(2);
  const averageSessionSeconds =
    totalSessionsCount > 0
      ? Math.floor(totalStudySeconds / totalSessionsCount)
      : 0;
  const avgMinutes = Math.floor(averageSessionSeconds / 60);
  const avgSeconds = averageSessionSeconds % 60;
  const currentStreak = calculateStreak();

  // Compute video suggestions based on the study topic.
  const suggestions = useMemo(() => {
    return videoSuggestionsMapping[studyTopic.trim().toLowerCase()] || [];
  }, [studyTopic]);

  // YouTube Search Functionality
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
          searchQuery
        )}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items) {
        const videos = data.items.map((item) => ({
          title: item.snippet.title,
          videoId: item.id.videoId,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
        }));
        setSearchResults(videos);
      }
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" style={{ marginTop: 20, marginBottom: 20 }}>
        <Grid container spacing={3}>
          {/* Timer Section */}
          <Grid item xs={12} md={6} style={{ position: "relative" }}>
            <Paper style={{ padding: 20, textAlign: "center" }}>
              <Typography variant="h6">
                {isBreak ? "Break Time (5 minutes)" : "Work Session (25 minutes)"}
              </Typography>
              <Typography variant="h4" style={{ margin: "20px 0" }}>
                {formatTime(timeLeft)}
              </Typography>
              <Typography variant="subtitle1">
                Work sessions remaining: {sessionsRemaining}
              </Typography>
              <Button
                onClick={isRunning ? pauseTimer : startTimer}
                variant="contained"
                style={{ margin: "0 10px" }}
              >
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button onClick={resetTimer} variant="outlined" color="error">
                Reset
              </Button>
            </Paper>
          </Grid>

          {/* Study Goal & Topic Input Section */}
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 20 }}>
              <Typography
                variant="subtitle1"
                style={{ display: "flex", alignItems: "center" }}
              >
                <TrackChangesSharpIcon style={{ marginRight: "10px" }} />
                Set your study goal (in hours):
              </Typography>
              <FormControl fullWidth style={{ marginTop: "10px" }}>
                <TextField
                  label="Hours"
                  type="number"
                  value={studyGoal}
                  onChange={handleStudyGoalChange}
                  variant="outlined"
                  inputProps={{ min: 0 }}
                />
              </FormControl>
              <Typography variant="body1" style={{ marginTop: "10px" }}>
                Total Pomodoro sessions: {sessionsTotal}
              </Typography>
            </Paper>
          </Grid>

          {/* Calendar Tracker */}
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 20, height: "400px" }}>
              <Typography variant="h6" gutterBottom>
                Calendar Tracker
              </Typography>
              <Calendar
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const dateString = date.toLocaleDateString("en-CA");
                    return studyDays.includes(dateString) ? "highlight" : null;
                  }
                }}
              />
            </Paper>
          </Grid>

          {/* YouTube Video Suggestions & Search */}
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 20, height: "400px", overflowY: "auto" }}>
              <Typography variant="h6" gutterBottom>
                YouTube Video Suggestions
              </Typography>
              <FormControl fullWidth style={{ marginBottom: "10px" }}>
                <TextField
                  label="Search YouTube Videos"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleSearch}>
                Search
              </Button>
              <div style={{ marginTop: "20px" }}>
                {searchResults.length > 0 ? (
                  searchResults.map((video) => (
                    <div key={video.videoId} style={{ marginBottom: 20 }}>
                      <Typography variant="subtitle1">{video.title}</Typography>
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ))
                ) : suggestions.length > 0 ? (
                  suggestions.map((video) => (
                    <div key={video.videoId} style={{ marginBottom: 20 }}>
                      <Typography variant="subtitle1">{video.title}</Typography>
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ))
                ) : (
                  <Typography variant="body2">
                    No video suggestions available for this subject.
                  </Typography>
                )}
              </div>
            </Paper>
          </Grid>

          {/* Progress Dashboard Section */}
          <Grid item xs={12}>
            <Paper style={{ padding: 20 }}>
              <Typography variant="h6" gutterBottom>
                Progress Dashboard
              </Typography>
              <Typography variant="body1">
                <strong>Total Sessions:</strong> {totalSessionsCount}
              </Typography>
              <Typography variant="body1">
                <strong>Total Study Time:</strong> {totalStudyMinutes} minutes (
                {totalStudyHours} hours)
              </Typography>
              <Typography variant="body1">
                <strong>Average Session Duration:</strong> {avgMinutes} minutes{" "}
                {avgSeconds} seconds
              </Typography>
              <Typography variant="body1">
                <strong>Current Streak:</strong> {currentStreak}{" "}
                {currentStreak === 1 ? "day" : "days"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Fixed Menu Button at Bottom Right using MUI MenuIcon */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 3000,
        }}
      >
        <IconButton
          onClick={handleMenuOpen}
          color="inherit"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: 12,
          }}
        >
          <MenuIcon />
        </IconButton>
      </div>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        
        <MenuItem
          onClick={() => {
            setShowBackgroundMusic((prev) => !prev);
            handleMenuClose();
          }}
        >
          {showBackgroundMusic
            ? "Hide Background Music"
            : "Play Background Music"}
        </MenuItem>
      </Menu>

     
    

      {showBackgroundMusic && (
        <Draggable nodeRef={backgroundMusicRef}>
          <div
            ref={backgroundMusicRef}
            style={{
              position: "fixed",
              top: 150,
              left: 150,
              zIndex: 2000,
              backgroundColor: "#121212",
              color: "#fff",
              padding: 10,
              borderRadius: 4,
              boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
              cursor: "move",
              width: "600px",
            }}
          >
            <Typography variant="h6">Background Music</Typography>
            <iframe
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
              width="100%"
              height="80"
              frameBorder="0"
              allowTransparency="true"
              allow="encrypted-media"
              title="Spotify Background Music"
            ></iframe>
          </div>
        </Draggable>
      )}

      {showNotes && (
        <Draggable nodeRef={notesRef}>
          <div
            ref={notesRef}
            style={{
              position: "fixed",
              top: 250,
              left: 250,
              zIndex: 2000,
              backgroundColor: "#fff",
              color: "#fff",
              padding: 10,
              borderRadius: 4,
              boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
              cursor: "move",
              width: "300px",
            }}
          >
            <Typography variant="h6">Notes</Typography>
            <Typography variant="body2">
              Notes integration (Notion/Notes API) goes here.
            </Typography>
          </div>
        </Draggable>
      )}

      {/* Snackbar for popup messages */}
      <Snackbar
        open={popup.open}
        message={popup.message}
        autoHideDuration={3000}
        onClose={() => setPopup({ open: false, message: "" })}
      />

      {/* Inline CSS for React Calendar */}
      <style>{`
        .react-calendar {
          background: #fff;
          color: #fff;
          border: 1px solid #ddd;
          font-family: Arial, Helvetica, sans-serif;
        }
        .react-calendar__navigation {
          background: #fff;
        }
        .react-calendar__navigation button {
          color: #333;
          background: none;
          border: none;
          font-size: 16px;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f0f0f0;
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
        }
        .react-calendar__month-view__weekdays__weekday {
          color: #333;
        }
        .react-calendar__tile {
          max-width: 100%;
          text-align: center;
          padding: 10px 6.6667px;
          background: #fff;
          border: 1px solid #ddd;
          color: #333;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f0f0f0;
        }
        .react-calendar__tile--active {
          background: #333;
          color: #fff;
        }
        .highlight {
          background: #ccc !important;
          color: #333 !important;
          border-radius: 50% !important;
        }
      `}</style>
    </ThemeProvider>
  );
};

export default StudyPlanner;
