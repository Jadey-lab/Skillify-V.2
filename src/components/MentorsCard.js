import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, CardText, Button, Row, Col } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MentorsCard = ({ mentor }) => {
  const [isBookSessionOpen, setIsBookSessionOpen] = useState(false);
  const [isPayGateOpen, setIsPayGateOpen] = useState(false);
  const [coffeeAmount, setCoffeeAmount] = useState(45); // default amount
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    date: '',
    fieldOfStudy: '',
    yearOfStudy: '',
    assistanceType: '',
    emergencyContact: '',
  });
  const [userId, setUserId] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const toggleBookSession = () => setIsBookSessionOpen(!isBookSessionOpen);
  const togglePayGate = () => setIsPayGateOpen(!isPayGateOpen);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const triggerAlert = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      triggerAlert("You need to be logged in to book a session", "error");
      return;
    }

    try {
      await addDoc(collection(db, 'mentorBookings'), {
        ...bookingData,
        mentorId: mentor.name,
        uid: userId,
        timestamp: new Date(),
      });
      triggerAlert("Booking submitted successfully!", "success");
      toggleBookSession();
      setBookingData({
        name: '',
        email: '',
        date: '',
        fieldOfStudy: '',
        yearOfStudy: '',
        assistanceType: '',
      });
    } catch (error) {
      console.error('Error adding booking: ', error);
      triggerAlert("Failed to submit booking", "error");
    }
  };

  const handleCoffeePayment = () => {
    if (coffeeAmount < 45) {
      triggerAlert("Minimum coffee amount is R45", "error");
      return;
    }

    const merchantId = "29069369";
    const merchantKey = "z5gequa4vjfnt";
    const payfastUrl = "https://www.payfast.co.za/eng/process";

    const itemName = `Buy Coffee Donation - MentorID: ${mentor.name}`;

    const params = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      amount: coffeeAmount,
      item_name: itemName,
      email_confirmation: 1,
      confirmation_address: "info@yourplatform.com",
      return_url: `https://shadowascientist.org/payment%20success`,
      cancel_url: `https://shadowascientist.org/payment%20canceled`,
      custom_str1: mentor.mentorId,
      custom_str2: mentor.mentorId
    };

    const queryString = new URLSearchParams(params).toString();
    window.location.href = `${payfastUrl}?${queryString}`;
  };

  const donationAmount = Math.round(coffeeAmount * 0.2);

  return (
    <>
      <Card className="mentor-card">
        <img src={mentor.image} alt={mentor.name} className="card-img-top" />
        <CardBody>
          <CardTitle
            tag="h5"
            style={{ fontSize: '1.5rem', color: 'black', textAlign: 'center', marginBottom: '1rem' }}
          >
            {mentor.name}
          </CardTitle>
          <CardText>{mentor.field}</CardText>
          <Row>
            <Col xs="6">
              <Button color="primary" onClick={toggleBookSession}>
                Book Session
              </Button>
            </Col>
            <Col xs="6">
              <Button color="secondary" onClick={togglePayGate}>
                Buy Coffee
              </Button>
            </Col>
          </Row>
        </CardBody>

        {/* Book Session Modal */}
        <Modal isOpen={isBookSessionOpen} toggle={toggleBookSession} className="modal-dialog-centered">
          <ModalHeader toggle={toggleBookSession} className="modal-dialog-centered custom-modal">
            Book a Session with {mentor.name}
          </ModalHeader>
          <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="name">Your Name</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  value={bookingData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="email">Your Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  value={bookingData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="date">Preferred Date</Label>
                <Input
                  type="date"
                  name="date"
                  id="date"
                  value={bookingData.date}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="fieldOfStudy">Field of Study</Label>
                <Input
                  type="text"
                  name="fieldOfStudy"
                  id="fieldOfStudy"
                  value={bookingData.fieldOfStudy}
                  onChange={handleChange}
                  required
                  placeholder="Enter your field of study"
                />
              </FormGroup>
              <FormGroup>
                <Label for="yearOfStudy">Year of Study</Label>
                <Input
                  type="select"
                  name="yearOfStudy"
                  id="yearOfStudy"
                  value={bookingData.yearOfStudy}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your year of study</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Honors">Honors</option>
                  <option value="Masters">Masters</option>
                  <option value="PHD">PHD</option>
                  <option value="Other">Other</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="assistanceType">Type of Assistance Needed</Label>
                <Input
                  type="select"
                  name="assistanceType"
                  id="assistanceType"
                  value={bookingData.assistanceType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select assistance type</option>
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Academic Mentorship">Academic Mentorship</option>
                  <option value="Research Support">Research Support</option>
                  <option value="Personal Development">Personal Development</option>
                </Input>
              </FormGroup>
             


              <ModalFooter>
                <Row className="w-100">
                  <Col xs="6" className="text-end">
                    <Button color="secondary" onClick={toggleBookSession}>
                      Cancel
                    </Button>
                  </Col>
                  <Col xs="6" className="text-start">
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </Col>
                </Row>
              </ModalFooter>
            </Form>
          </ModalBody>
        </Modal>

        {/* Buy Coffee Modal */}
        <Modal isOpen={isPayGateOpen} toggle={togglePayGate} className="modal-dialog-centered">
          <ModalHeader toggle={togglePayGate}>Buy Coffee for {mentor.name}</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="coffeeAmount">Coffee Amount (Min R45)</Label>
                <Input
                  type="number"
                  name="coffeeAmount"
                  id="coffeeAmount"
                  min="45"
                  value={coffeeAmount}
                  onChange={(e) => setCoffeeAmount(e.target.value)}
                />
              </FormGroup>
              <p style={{ marginTop: '1rem' }}>
                <strong>Donation to Marketing:</strong> R{donationAmount}
              </p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#555' }}>
                <em>
                  By buying coffee, you're not just fueling our amazing mentors — you're supporting free access to mentorship for students
                  across the country. 20% of your contribution goes toward maintaining the platform, covering maintenance costs, and raising funds to add new features for students to benefit from. ❤️
                </em>
              </p>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Row className="w-100">
              <Col xs="6" className="text-end">
                <Button color="secondary" onClick={togglePayGate}>
                  Cancel
                </Button>
              </Col>
              <Col xs="6" className="text-start">
                <Button color="success" onClick={handleCoffeePayment}>
                  Buy Coffee
                </Button>
              </Col>
            </Row>
          </ModalFooter>
        </Modal>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MentorsCard;
