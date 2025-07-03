import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Tabs, Input } from 'antd';
import {
  getFirestore,
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  where
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [jobListings, setJobListings] = useState([]);

  // Job listing states
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  const [company, setCompany] = useState('');
  const [jobLink, setJobLink] = useState('');

  // Snackbar state for messages
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Event participants states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantPage, setParticipantPage] = useState(1);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const itemsPerPage = 10;

  // RSVP capacity inputs state
  const [capacityInputs, setCapacityInputs] = useState({});

  // Checked in users states
  const [checkedInUsers, setCheckedInUsers] = useState([]);
  const [checkedInLoading, setCheckedInLoading] = useState(false);
  const [checkedInPage, setCheckedInPage] = useState(1);
  const [checkedInSearchTerm, setCheckedInSearchTerm] = useState('');

  // Feedback states
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');

  const db = getFirestore();
  const auth = getAuth();
  const pexelsApiKey = 'YOUR_PEXELS_API_KEY';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserRole(currentUser.uid);
        fetchEvents();
        fetchJobListings();
        fetchCheckedInUsers();
        fetchFeedbacks();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const response = await axios.get('https://api.pexels.com/v1/curated', {
          headers: { Authorization: pexelsApiKey }
        });
        setThumbnails(response.data.photos);
      } catch (error) {
        console.error('Error fetching Pexels thumbnails:', error);
      }
    };
    fetchThumbnails();
  }, []);

  // Fetch job listings
  const fetchJobListings = async () => {
    try {
      const jobListingsRef = collection(db, 'jobListings');
      const q = query(jobListingsRef);
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setJobListings(jobs);
    } catch (error) {
      console.error("Error fetching job listings:", error);
    }
  };

  // Upload job listing
  const handleUploadJob = async () => {
    if (!isAdmin) {
      alert('Only admins can upload job listings.');
      return;
    }
    
    if (!jobTitle || !jobDescription || !location || !requirements || !jobLink) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await addDoc(collection(db, 'jobListings'), {
        jobTitle,
        jobDescription,
        location,
        requirements,
        company: company || 'Not specified',
        jobLink,
        createdAt: new Date()
      });
      setSnackbarMessage('Job listing added successfully!');
      setSnackbarOpen(true);
      
      // Reset form fields
      setJobTitle('');
      setJobDescription('');
      setLocation('');
      setRequirements('');
      setCompany('');
      setJobLink('');
      
      fetchJobListings();
    } catch (error) {
      console.error('Error uploading job listing:', error);
      alert('Error uploading job listing. Please try again.');
    }
  };

  const fetchUserRole = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setIsAdmin(userData.role === 'admin');
      } else {
        console.log('User not found!');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const generateShortCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const updateCheckInCode = async (eventId, newCheckInCode) => {
    try {
      const eventRef = doc(db, 'myevents', eventId);
      await updateDoc(eventRef, { selfCheckinCode: newCheckInCode });
      console.log('Check-in code updated in Firestore');
    } catch (error) {
      console.error('Error updating check-in code:', error);
    }
  };

  const deleteCheckInCode = async (eventId) => {
    try {
      const eventRef = doc(db, 'myevents', eventId);
      await deleteDoc(eventRef);
      console.log('Event deleted, check-in code removed');
    } catch (error) {
      console.error('Error deleting check-in code:', error);
    }
  };

  // Fetch events (grouped by eventTitle) and include RSVP capacity if available.
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsRef = collection(db, 'myevents');
      const q = query(eventsRef);
      const querySnapshot = await getDocs(q);
      const eventCounts = {};

      querySnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const eventId = docSnap.id;
        const newCheckInCode = generateShortCode();

        if (eventCounts[data.eventTitle]) {
          eventCounts[data.eventTitle].count += 1;
          if (data.attended) {
            eventCounts[data.eventTitle].attended += 1;
          }
          if (!eventCounts[data.eventTitle].rsvpCapacity && data.rsvpCapacity) {
            eventCounts[data.eventTitle].rsvpCapacity = data.rsvpCapacity;
          }
        } else {
          eventCounts[data.eventTitle] = {
            count: 1,
            attended: data.attended ? 1 : 0,
            selfCheckinCode: newCheckInCode,
            rsvpCapacity: data.rsvpCapacity || ''
          };
          updateCheckInCode(eventId, newCheckInCode);
        }
      });

      setEvents(Object.entries(eventCounts).map(([title, stats]) => ({ eventTitle: title, ...stats })));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch checked in users (attended true)
  const fetchCheckedInUsers = async () => {
    setCheckedInLoading(true);
    try {
      const eventsRef = collection(db, 'myevents');
      const q = query(eventsRef, where('attended', '==', true));
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setCheckedInUsers(users);
      setCheckedInPage(1);
    } catch (error) {
      console.error('Error fetching checked in users:', error);
    } finally {
      setCheckedInLoading(false);
    }
  };

  // Fetch feedbacks from the 'feedback' collection
  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const feedbackRef = collection(db, 'feedback');
      const q = query(feedbackRef);
      const querySnapshot = await getDocs(q);
      const fb = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setFeedbacks(fb);
      setFeedbackPage(1);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Overall attendance stats (based on capacity when available)
  const totalEvents = events.length;
  const totalRSVPs = events.reduce((sum, event) => sum + event.count, 0);
  const totalAttended = events.reduce((sum, event) => sum + event.attended, 0);
  const totalEffectiveCapacity = events.reduce(
    (sum, event) => sum + (event.rsvpCapacity && event.rsvpCapacity > 0 ? event.rsvpCapacity : event.count),
    0
  );
  const overallAttendanceRate = totalEffectiveCapacity > 0 
    ? ((totalAttended / totalEffectiveCapacity) * 100).toFixed(2) 
    : 0;

  const filteredEvents = events.filter((event) =>
    event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch participants for a given event
  const fetchParticipants = async (eventTitle) => {
    setParticipantLoading(true);
    try {
      const participantsRef = collection(db, 'myevents');
      const q = query(participantsRef, where('eventTitle', '==', eventTitle));
      const querySnapshot = await getDocs(q);
      const fetchedParticipants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(fetchedParticipants);
      setParticipantPage(1);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setParticipantLoading(false);
    }
  };

  // When admin clicks "View Participants"
  const handleViewParticipants = (event) => {
    setSelectedEvent(event);
    setParticipantSearchTerm('');
    fetchParticipants(event.eventTitle);
  };

  // Filter participants based on search term
  const filteredParticipants = participants.filter((p) => {
    const search = participantSearchTerm.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  // Pagination for participants
  const totalParticipantPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const currentParticipants = filteredParticipants.slice(
    (participantPage - 1) * itemsPerPage,
    participantPage * itemsPerPage
  );
  const handlePrevParticipantPage = () => { if (participantPage > 1) setParticipantPage(participantPage - 1); };
  const handleNextParticipantPage = () => { if (participantPage < totalParticipantPages) setParticipantPage(participantPage + 1); };

  // Filter checked in users
  const filteredCheckedIn = checkedInUsers.filter((user) => {
    const search = checkedInSearchTerm.toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return name.includes(search) || email.includes(search);
  });
  // Pagination for checked in users
  const totalCheckedInPages = Math.ceil(filteredCheckedIn.length / itemsPerPage);
  const currentCheckedIn = filteredCheckedIn.slice(
    (checkedInPage - 1) * itemsPerPage,
    checkedInPage * itemsPerPage
  );
  const handlePrevCheckedInPage = () => { if (checkedInPage > 1) setCheckedInPage(checkedInPage - 1); };
  const handleNextCheckedInPage = () => { if (checkedInPage < totalCheckedInPages) setCheckedInPage(checkedInPage + 1); };

  // Filter feedbacks based on search term (by name or content)
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const search = feedbackSearchTerm.toLowerCase();
    const name = (fb.name || '').toLowerCase();
    const feedbackText = (fb.feedback || '').toLowerCase();
    return name.includes(search) || feedbackText.includes(search);
  });
  // Pagination for feedbacks
  const totalFeedbackPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const currentFeedbacks = filteredFeedbacks.slice(
    (feedbackPage - 1) * itemsPerPage,
    feedbackPage * itemsPerPage
  );
  const handlePrevFeedbackPage = () => { if (feedbackPage > 1) setFeedbackPage(feedbackPage - 1); };
  const handleNextFeedbackPage = () => { if (feedbackPage < totalFeedbackPages) setFeedbackPage(feedbackPage + 1); };

  // Admin checks in a participant
  const adminCheckIn = async (participantId) => {
    try {
      const participantRef = doc(db, 'myevents', participantId);
      await updateDoc(participantRef, { attended: true });
      setSnackbarMessage('Participant checked in successfully!');
      setSnackbarOpen(true);
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, attended: true } : p));
      fetchCheckedInUsers();
    } catch (error) {
      console.error('Error checking in participant:', error);
      alert('Error checking in participant.');
    }
  };

  // Update RSVP capacity for an event
  const updateEventCapacity = async (eventTitle, capacity) => {
    try {
      const eventsRef = collection(db, 'myevents');
      const q = query(eventsRef, where('eventTitle', '==', eventTitle));
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach(async (docSnap) => {
        await updateDoc(docSnap.ref, { rsvpCapacity: capacity });
      });
      setSnackbarMessage('RSVP capacity updated successfully!');
      setSnackbarOpen(true);
      fetchEvents();
    } catch (error) {
      console.error('Error updating capacity:', error);
      alert('Error updating RSVP capacity.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Admin Dashboard
      </Typography>
      {isAdmin ? (
        <Tabs defaultActiveKey="1">
          <TabPane tab="Overview" key="1">
            <Box sx={{ mb: 3, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Overall Attendance Stats</Typography>
              <Typography>Total Events: {totalEvents}</Typography>
              <Typography>Total RSVPs: {totalRSVPs}</Typography>
              <Typography>Total Attended: {totalAttended}</Typography>
              <Typography>Overall Attendance Rate: {overallAttendanceRate}%</Typography>
            </Box>
          </TabPane>

         

          <TabPane tab="Event Details" key="2">
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Search Events"
                  sx={{ mb: 3, borderRadius: 3 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Grid container spacing={2}>
                  {filteredEvents.map((event, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ p: 3, boxShadow: 5, borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            {event.eventTitle}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Total RSVPs: {event.count}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Total Attended: {event.attended}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            Attendance Rate:{" "}
                            {event.rsvpCapacity && event.rsvpCapacity > 0
                              ? ((event.attended / event.rsvpCapacity) * 100).toFixed(2)
                              : ((event.attended / event.count) * 100).toFixed(2)
                            }%
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Self Check-in Code: {event.selfCheckinCode}
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="RSVP Capacity"
                            sx={{ mb: 2 }}
                            value={capacityInputs[event.eventTitle] !== undefined ? capacityInputs[event.eventTitle] : event.rsvpCapacity}
                            onChange={(e) => setCapacityInputs({ ...capacityInputs, [event.eventTitle]: e.target.value })}
                          />
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => updateEventCapacity(event.eventTitle, parseInt(capacityInputs[event.eventTitle] || event.rsvpCapacity, 10))}
                            sx={{ textTransform: 'capitalize', mr: 1 }}
                          >
                            Update Capacity
                          </Button>
                          {event.rsvpCapacity && event.count >= event.rsvpCapacity && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                              Maximum capacity reached.
                            </Typography>
                          )}
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => deleteCheckInCode(event.eventId)}
                            sx={{ textTransform: 'capitalize', mr: 1, mt: 2 }}
                          >
                            Delete Check-in Code
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleViewParticipants(event)}
                            sx={{ textTransform: 'capitalize', mt: 2 }}
                          >
                            View Participants
                          </Button>
                          {thumbnails.length > 0 && (
                            <img
                              src={thumbnails[index % thumbnails.length].src.medium}
                              alt="Event Thumbnail"
                              style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '16px' }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </TabPane>

          <TabPane tab="Job Listings" key="3">
            <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Upload a Job Listing
              </Typography>
              <TextField
                fullWidth
                label="Job Title"
                variant="outlined"
                sx={{ mb: 2 }}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              <TextField
                fullWidth
                label="Job Description"
                variant="outlined"
                multiline
                rows={4}
                sx={{ mb: 2 }}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <TextField
                fullWidth
                label="Location"
                variant="outlined"
                sx={{ mb: 2 }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <TextField
                fullWidth
                label="Requirements"
                variant="outlined"
                sx={{ mb: 2 }}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
              <TextField
                fullWidth
                label="Company (Optional)"
                variant="outlined"
                sx={{ mb: 2 }}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Input
                placeholder="Job Link"
                style={{ marginBottom: '16px' }}
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
              />
              <Button variant="contained" color="primary" onClick={handleUploadJob}>
                Upload Job
              </Button>
            </Box>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Available Job Listings
              </Typography>
              <Grid container spacing={2}>
                {jobListings.map((job) => (
                  <Grid item xs={12} md={6} key={job.id}>
                    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          {job.jobTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {job.jobDescription}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Location: {job.location}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Requirements: {job.requirements}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Company: {job.company}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Job Link:{' '}
                          <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                            {job.jobLink}
                          </a>
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          Posted on:{' '}
                          {job.createdAt
                            ? new Date(job.createdAt.seconds * 1000).toLocaleString()
                            : 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPane>

          <TabPane tab="Checked In Users" key="4">
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Checked In Users
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Checked In Users"
                sx={{ mb: 3, borderRadius: 3 }}
                value={checkedInSearchTerm}
                onChange={(e) => setCheckedInSearchTerm(e.target.value)}
              />
              {checkedInLoading ? (
                <CircularProgress />
              ) : (
                <>
                  {currentCheckedIn.length > 0 ? (
                    <Grid container spacing={2}>
                      {currentCheckedIn.map((user) => (
                        <Grid item xs={12} key={user.id}>
                          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {user.name || 'No Name Provided'}
                            </Typography>
                            <Typography variant="body2">
                              Email: {user.email || 'No Email Provided'}
                            </Typography>
                            <Typography variant="body2">
                              Phone: {user.phone || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              Checked In At: {user.Timestamp ? new Date(user.Timestamp).toLocaleString() : 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography>No checked in users found.</Typography>
                  )}
                  {totalCheckedInPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button variant="outlined" onClick={handlePrevCheckedInPage} disabled={checkedInPage === 1}>
                        Previous
                      </Button>
                      <Typography>
                        Page {checkedInPage} of {totalCheckedInPages}
                      </Typography>
                      <Button variant="outlined" onClick={handleNextCheckedInPage} disabled={checkedInPage === totalCheckedInPages}>
                        Next
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </TabPane>

          <TabPane tab="Feedback" key="5">
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
      Feedbacks
    </Typography>
    <TextField
      fullWidth
      variant="outlined"
      label="Search Feedbacks"
      sx={{ mb: 3, borderRadius: 3 }}
      value={feedbackSearchTerm}
      onChange={(e) => setFeedbackSearchTerm(e.target.value)}
    />
    {feedbackLoading ? (
      <CircularProgress />
    ) : (
      <>
        {currentFeedbacks.length > 0 ? (
          <Grid container spacing={2}>
            {currentFeedbacks.map((fb) => (
              <Grid item xs={12} key={fb.id}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {fb.name} {fb.surname}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Event:</strong> {fb.eventTitle} ({fb.eventDate})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comment:</strong> {fb.comment || fb.feedback}
                  </Typography>
                  {fb.rating != null && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Rating:</strong> {fb.rating}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Submitted:</strong>{' '}
                    {fb.timestamp?.toDate
                      ? fb.timestamp.toDate().toLocaleString()
                      : new Date(fb.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No feedbacks found.</Typography>
        )}
        {totalFeedbackPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Button variant="outlined" onClick={handlePrevFeedbackPage} disabled={feedbackPage === 1}>
              Previous
            </Button>
            <Typography>
              Page {feedbackPage} of {totalFeedbackPages}
            </Typography>
            <Button variant="outlined" onClick={handleNextFeedbackPage} disabled={feedbackPage === totalFeedbackPages}>
              Next
            </Button>
          </Box>
        )}
      </>
    )}
  </Box>
</TabPane>
        </Tabs>
      ) : (
        <Typography variant="h6" color="error">
          Unauthorized Access
        </Typography>
      )}

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialog for viewing participants */}
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Participants for {selectedEvent?.eventTitle}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            variant="outlined"
            label="Search Participants"
            margin="normal"
            value={participantSearchTerm}
            onChange={(e) => setParticipantSearchTerm(e.target.value)}
          />
          {participantLoading ? (
            <CircularProgress />
          ) : (
            <>
              {currentParticipants.length > 0 ? (
                <Grid container spacing={2}>
                  {currentParticipants.map((p) => (
                    <Grid item xs={12} key={p.id}>
                      <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {p.name || 'No Name Provided'}
                        </Typography>
                        <Typography variant="body2">
                          Email: {p.email || 'No Email Provided'}
                        </Typography>
                        <Typography variant="body2">
                          Phone: {p.phone || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Institution: {p.institution || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Field of Study: {p.fieldOfStudy || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Occupation: {p.occupation || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Year of Study: {p.yearOfStudy || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Event Date: {p.eventDate ? new Date(p.eventDate).toLocaleString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Registered At: {p.Timestamp ? new Date(p.Timestamp).toLocaleString() : 'N/A'}
                        </Typography>
                        {!p.attended && (
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => adminCheckIn(p.id)}
                            sx={{ mt: 1 }}
                          >
                            Check In
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>No participants found.</Typography>
              )}
              {totalParticipantPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Button variant="outlined" onClick={handlePrevParticipantPage} disabled={participantPage === 1}>
                    Previous
                  </Button>
                  <Typography>
                    Page {participantPage} of {totalParticipantPages}
                  </Typography>
                  <Button variant="outlined" onClick={handleNextParticipantPage} disabled={participantPage === totalParticipantPages}>
                    Next
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
