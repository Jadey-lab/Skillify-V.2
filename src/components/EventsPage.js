import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress
} from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import './events.css';

const EventsPage = () => {
  const [open, setOpen] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [events, setEvents] = useState([]);
  const [uid, setUid] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [closedEvents, setClosedEvents] = useState({});

  // List of South African Universities
  const universities = [
    "University of Cape Town (UCT)",
    "University of the Witwatersrand (Wits)",
    "Stellenbosch University (SU)",
    "University of Pretoria (UP)",
    "University of KwaZulu-Natal (UKZN)",
    "University of the Free State (UFS)",
    "North-West University (NWU)",
    "University of Johannesburg (UJ)",
    "University of South Africa (UNISA)",
    "Rhodes University",
    "University of Limpopo",
    "Cape Peninsula University of Technology (CPUT)",
    "Durban University of Technology (DUT)",
    "Nelson Mandela University (NMU)",
    "Tshwane University of Technology (TUT)",
    "Central University of Technology (CUT)",
    "Vaal University of Technology (VUT)",
    "University of Mpumalanga (UMP)",
    "Sol Plaatje University",
    "University of Venda"
  ];

  const apiKey = "AIzaSyDmiqEIZl5XSRBHwGIrPPNnJ9GP9xpvQgQ";
  const calendarId = "339cfbd36865c5e9b75afbe1c32c9c9753214d0974c3230f8400d412de937e88@group.calendar.google.com";
  const maxResults = 5;

  const db = getFirestore();

  const fetchEventImage = async (title) => {
    try {
      const query = `${title} science laboratory research`;
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          Authorization: 'wVfIHYpcNwD2ujAjcLjkxCk8ga5oLIqlDHAQ3rw3CrERleDci9uB7eLg'
        },
        params: {
          query: query,
          per_page: 1,
        }
      });

      const imageUrl = response.data.photos[0]?.src?.medium || '';
      setImageUrls((prevUrls) => ({
        ...prevUrls,
        [title]: imageUrl,
      }));
    } catch (error) {
      console.error("Error fetching image from Pexels:", error);
    }
  };

  // Listen for Firebase Auth state changes and check for admin role.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsAdmin(userData.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } else {
        setUid('');
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, [db]);

  // Fetch events from Google Calendar.
  const fetchEvents = async () => {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setEvents(data.items);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch closed status for events from Firestore.
  const fetchClosedEvents = async () => {
    const eventStatusCollection = collection(db, "eventStatus");
    const querySnapshot = await getDocs(eventStatusCollection);
    let status = {};
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      status[docSnap.id] = data.closed;
    });
    setClosedEvents(status);
  };

  useEffect(() => {
    fetchEvents();
    fetchClosedEvents();
  }, [db]);

  useEffect(() => {
    events.forEach((event) => {
      const title = event.summary;
      if (!imageUrls[title]) {
        fetchEventImage(title);
      }
    });
  }, [events, imageUrls]);

  // Toggle reservation closed/open for an event (admin only) and persist to Firestore.
  const toggleCloseReservation = async (eventId) => {
    const eventDocRef = doc(db, "eventStatus", eventId.toString());
    const newStatus = !closedEvents[eventId];
    try {
      // Use setDoc to create/update the document.
      await setDoc(eventDocRef, { closed: newStatus });
      setClosedEvents((prev) => ({
        ...prev,
        [eventId]: newStatus,
      }));
    } catch (error) {
      console.error("Error updating event status:", error);
    }
  };

  // Open the modal and set the current event title and date.
  const handleOpen = (title, date) => {
    setEventTitle(title);
    setEventDate(date);
    setOpen(true);
  };

  // Close the modal.
  const handleClose = () => {
    setOpen(false);
  };

  const handleShare = (title, date, eventId) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?event=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}#event-${eventId}`;
    if (navigator.share) {
      navigator.share({
        title: `Check out this event: ${title}`,
        text: 'Have a look at this event!',
        url: shareUrl
      })
      .then(() => console.log("Shared successfully"))
      .catch((err) => console.error("Error sharing", err));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert("Shareable link copied to clipboard!");
        })
        .catch((err) => {
          alert("Failed to copy shareable link");
        });
    }
  };

  // Handle form submission and show thank-you message.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.Timestamp = new Date().toISOString();
    data.uid = uid;
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbyD5XyPsRzDiRJvm56GlcIibdCw3_R5dQO5ubAGGdDsRCfAOvshVu5vWastsiP8bOIe/exec", {
        method: 'POST',
        body: new URLSearchParams(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to submit the reservation. Status: ${response.status}`);
      }
      await addDoc(collection(db, "myevents"), data);
      setOpen(false);
      setThankYouOpen(true);
      setTimeout(() => setThankYouOpen(false), 3000);
    } catch (error) {
      console.error("Error submitting the form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
        Shadow A Scientist Featured Events
      </Typography>

      <div className="container my-5">
        <div className="event-grid" id="eventGrid">
          {events.length === 0 ? (
            <Typography>No upcoming events.</Typography>
          ) : (
            events.map((event, index) => {
              const eventStart = event.start.dateTime || event.start.date;
              const date = new Date(eventStart).toLocaleDateString();
              const time = new Date(eventStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const title = event.summary || "No Title";
              const location = event.location || "Location TBC";
              const description = event.description || "";
              const eventType = description.split(" ").slice(0, 5).join(" ") || "General Event";
              const month = new Date(eventStart).toLocaleString('default', { month: 'short' });
              const day = new Date(eventStart).getDate();
              const imageUrl = imageUrls[title] || 'https://via.placeholder.com/600x400';
              const eventId = event.id || index; // Ensure each event has a unique ID

              return (
                <div className="event-card" key={index} id={`event-${eventId}`} style={{ backgroundImage: `url('${imageUrl}')` }}>
                  <div className="event-date-box">
                    <div className="month">{month}</div>
                    <div className="day">{day}</div>
                  </div>
                  <div className="event-content">
                    <Typography variant="h6" className="event-title">{title}</Typography>
                    <Typography className="event-type">{eventType}</Typography>
                    <Typography className="event-time">{time}</Typography>
                    <Typography className="event-location">{location}</Typography>
                    <Button 
                      variant="contained" 
                      className="reserve-btn" 
                      onClick={() => handleOpen(title, eventStart)}
                      disabled={closedEvents[eventId]}
                    >
                      {closedEvents[eventId] ? "Reservation Closed" : "Book Now"}
                    </Button>
                    {/* Admin-only button to toggle reservation state */}
                    {isAdmin && (
                      <Button 
                        variant="outlined"
                        color="error"
                        onClick={() => toggleCloseReservation(eventId)}
                        sx={{ mt: 1 }}
                      >
                        {closedEvents[eventId] ? "Reopen Reservation" : "Close Reservation"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reservation Modal */}
      <Modal open={open} onClose={handleClose}>
      <Box
        className="custom-scrollbar"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          maxHeight: '95vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          border: '2px solid #fff',
          borderRadius: '10px',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reservation Form for {eventTitle}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            type="tel"
            required
            inputProps={{
              pattern: '[0-9]{10,15}',
              title: 'Phone number should be between 10–15 digits',
            }}
            sx={{ mb: 2 }}
          />

          {/* Emergency Contact Section */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Emergency Contact
          </Typography>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            name="emergencyContactName"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Emergency Contact Phone"
            name="emergencyContactPhone"
            type="tel"
            required
            inputProps={{
              pattern: '[0-9]{10,15}',
              title: 'Emergency contact number should be between 10–15 digits',
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Relationship to Emergency Contact"
            name="emergencyContactRelation"
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Institution</InputLabel>
            <Select name="institution" required defaultValue="">
              <MenuItem value="" disabled>Select Institution</MenuItem>
              {universities.map((university, index) => (
                <MenuItem key={index} value={university}>
                  {university}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Field of Study"
            name="fieldOfStudy"
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Year of Study</InputLabel>
            <Select name="yearOfStudy" required defaultValue="">
              <MenuItem value="" disabled>Select Year</MenuItem>
              <MenuItem value="1">1st Year</MenuItem>
              <MenuItem value="2">2nd Year</MenuItem>
              <MenuItem value="3">3rd Year</MenuItem>
              <MenuItem value="4">4th Year</MenuItem>
              <MenuItem value="Graduate">Graduate</MenuItem>
              <MenuItem value="Honors">Honors</MenuItem>
              <MenuItem value="Masters">Masters</MenuItem>
              <MenuItem value="PHD">PHD</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Occupation"
            name="occupation"
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Event Title"
            name="eventTitle"
            value={eventTitle}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />

          {/* Hidden Inputs */}
          <input type="hidden" name="uid" value={uid} />
          <input type="hidden" name="eventDate" value={eventDate} />
          <input type="hidden" name="Timestamp" value="" />

          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Submit Reservation'
            )}
          </Button>
        </form>
      </Box>
    </Modal>

      {/* Thank You Modal */}
      <Modal open={thankYouOpen} onClose={() => setThankYouOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 250,
            bgcolor: 'background.paper',
            borderRadius: '10px',
            boxShadow: 24,
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6">Thank You for Your Reservation!</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default EventsPage;
