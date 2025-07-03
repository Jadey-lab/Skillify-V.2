import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Input, Select, Spin, Row, Col, message, Modal, Form, Rate } from 'antd';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  addDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EventThumbnail from './EventThumbnail';

const { Title, Text } = Typography;
const { Option } = Select;

const MyEvents = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [uid, setUid] = useState('');
  const [checkInCode, setCheckInCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [openCheckIn, setOpenCheckIn] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);

  const db = getFirestore();
  const auth = getAuth();
  const [form] = Form.useForm();

  // Helper to format a date as yyyy-mm-dd for display.
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        fetchMyEvents(user.uid);
      } else {
        setUid('');
        setMyEvents([]);
      }
    });
    return unsubscribe;
  }, [auth]);

  const fetchMyEvents = async (userId) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'myevents'), where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyEvents(eventsData);
    } catch (error) {
      message.error('Error fetching events');
      console.error('Fetch events error:', error);
    }
    setLoading(false);
  };

  const toggleCheckIn = (eventId) => {
    setOpenCheckIn(openCheckIn === eventId ? null : eventId);
  };

  const handleSelfCheckIn = async (eventId) => {
    setLoading(true);
    try {
      const eventRef = doc(db, 'myevents', eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const eventData = eventSnap.data();
        if (checkInCode === eventData.selfCheckinCode) {
          await updateDoc(eventRef, { attended: true });
          message.success('Self check-in successful!');
          setCheckInCode('');
          setOpenCheckIn(null);
          fetchMyEvents(uid);
        } else {
          message.error('Invalid check-in code');
        }
      } else {
        message.error('Event not found');
      }
    } catch (error) {
      message.error('Error checking in');
      console.error('Check-in error:', error);
    }
    setLoading(false);
  };

  const isEventExpired = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  // Apply filtering and sorting. Now you can filter by "upcoming", "past", "attended", or "not attended".
  const filteredAndSortedEvents = myEvents
    .filter(event => {
      if (filter === 'upcoming') return !isEventExpired(event.eventDate);
      if (filter === 'past') return isEventExpired(event.eventDate);
      if (filter === 'attended') return event.attended === true;
      if (filter === 'not attended') return !event.attended;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      return sortOrder === 'ascending' ? dateA - dateB : dateB - dateA;
    });

  // Group events by check-in status.
  const notCheckedInEvents = filteredAndSortedEvents.filter(event => !event.attended);
  const checkedInEvents = filteredAndSortedEvents.filter(event => event.attended);

  // Fetch feedback details for an event.
  const fetchFeedbackForEvent = async (event) => {
    try {
      const q = query(
        collection(db, 'feedback'),
        where('eventId', '==', event.id),
        where('uid', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length > 0) {
        const feedbackDoc = querySnapshot.docs[0];
        setEditingFeedbackId(feedbackDoc.id);
        const data = feedbackDoc.data();
        const displayTimestamp =
          data.timestamp && data.timestamp.toDate
            ? formatDate(data.timestamp.toDate())
            : formatDate(new Date());
        form.setFieldsValue({
          eventTitle: event.eventTitle,
          eventDate: event.eventDate ? formatDate(event.eventDate) : 'N/A',
          name: data.name,
          surname: data.surname,
          timestamp: displayTimestamp,
          feedback: data.feedback,
          rating: data.rating || 0
        });
      } else {
        setEditingFeedbackId(null);
        form.setFieldsValue({
          eventTitle: event.eventTitle,
          eventDate: event.eventDate ? formatDate(event.eventDate) : 'N/A',
          timestamp: formatDate(new Date())
        });
      }
    } catch (error) {
      message.error('Error fetching feedback');
      console.error('Fetch feedback error:', error);
    }
  };

  // Open modal and prepare feedback form. Only allow if the event is checked in.
  const openFeedbackModal = (event) => {
    if (!event.attended) {
      message.error('You must check in to submit feedback');
      return;
    }
    setSelectedEvent(event);
    form.resetFields();
    form.setFieldsValue({
      eventTitle: event.eventTitle,
      eventDate: event.eventDate ? formatDate(event.eventDate) : 'N/A'
    });
    fetchFeedbackForEvent(event);
    setFeedbackModalVisible(true);
  };

  const onFinish = (values) => {
    handleFeedbackSubmit(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form submission failed:', errorInfo);
    message.error('Please complete the required fields');
  };

  // Submit feedback to Firestore.
  const handleFeedbackSubmit = async (values) => {
    try {
      const feedbackData = {
        ...values,
        rating: values.rating || 0,
        eventId: selectedEvent.id,
        uid,
        timestamp: new Date()
      };
      if (editingFeedbackId) {
        await updateDoc(doc(db, 'feedback', editingFeedbackId), feedbackData);
        message.success('Feedback updated successfully');
      } else {
        await addDoc(collection(db, 'feedback'), feedbackData);
        message.success('Feedback submitted successfully');
      }
      setFeedbackModalVisible(false);
    } catch (error) {
      message.error('Error submitting feedback');
      console.error('Submission error:', error);
    }
  };

  // Render events group using a grid layout.
  const renderEventsGroup = (events, groupTitle) => {
    return (
      <>
        <Title level={3} style={{ marginTop: 30 }}>{groupTitle}</Title>
        <Row gutter={[16, 16]} justify="center">
          {events.map(event => {
            const eventDate = event.eventDate ? new Date(event.eventDate) : null;
            return (
              <Col key={event.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{
                    position: 'relative',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    minHeight: 350,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {/* Date Badge */}
                  {eventDate && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(255,255,255,0.85)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        textAlign: 'center',
                        zIndex: 1
                      }}
                    >
                      <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: '1' }}>
                        {eventDate.getDate()}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>
                        {eventDate.toLocaleString('default', { month: 'short' })}
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: '1', fontWeight: 'bold', marginTop: '-4px' }}>
                        {eventDate.getFullYear()}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '20px 10px' }}>
                    <EventThumbnail title={event.eventTitle} />
                    <Title level={4} style={{ wordBreak: 'break-word', marginBottom: 0 }}>
                      {event.eventTitle}
                    </Title>
                    <Text style={{ wordBreak: 'break-word', color: 'white' }}>
                      Date: {event.eventDate ? formatDate(event.eventDate) : 'N/A'}
                    </Text>
                  </div>

                  {/* Button Container */}
                  <div style={{ padding: '0 10px 20px' }}>
                    <Row gutter={10}>
                      <Col xs={24} md={12}>
                        <Button
                          type="primary"
                          onClick={() => toggleCheckIn(event.id)}
                          disabled={isEventExpired(event.eventDate) || event.attended}
                          style={{ width: '100%' }}
                        >
                          {event.attended ? 'Checked In' : 'Check-In'}
                        </Button>
                      </Col>
                      <Col xs={24} md={12}>
                        <Button
                          type="default"
                          onClick={() => openFeedbackModal(event)}
                          disabled={!event.attended}
                          style={{ width: '100%' }}
                        >
                          Feedback
                        </Button>
                      </Col>
                    </Row>
                    {openCheckIn === event.id && !event.attended && (
                      <div style={{ marginTop: 10 }}>
                        <Input
                          placeholder="Enter Check-In Code"
                          value={checkInCode}
                          onChange={(e) => setCheckInCode(e.target.value)}
                          style={{ marginBottom: 10 }}
                        />
                        <Button
                          type="default"
                          onClick={() => handleSelfCheckIn(event.id)}
                          disabled={isEventExpired(event.eventDate)}
                          block
                        >
                          Self Check-In
                        </Button>
                      </div>
                    )}
                    {isEventExpired(event.eventDate) && (
                      <Text type="danger" style={{ display: 'block', marginTop: 5 }}>
                        Event date has passed, check-in is no longer available.
                      </Text>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </>
    );
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        padding: 20,
        fontFamily: "'Montserrat', sans-serif"
      }}
    >
      <Title level={2} style={{ textAlign: 'center' }}>My Events</Title>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, marginBottom: 20 }}>
        <Select
          value={filter}
          onChange={setFilter}
          style={{ flex: 1, minWidth: 150 }}
          placeholder="Filter Events"
        >
          <Option value="">All Events</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="past">Past</Option>
          <Option value="attended">Attended Events</Option>
          <Option value="not attended">Not Attended Events</Option>
        </Select>
        <Select
          value={sortOrder}
          onChange={setSortOrder}
          style={{ flex: 1, minWidth: 150 }}
          placeholder="Sort By"
        >
          <Option value="ascending">Date (Ascending)</Option>
          <Option value="descending">Date (Descending)</Option>
        </Select>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '0 auto' }} />
      ) : filteredAndSortedEvents.length === 0 ? (
        <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
          No events found.
        </Text>
      ) : (
        <>
          {notCheckedInEvents.length > 0 && renderEventsGroup(notCheckedInEvents, 'No Check-In Events')}
          {checkedInEvents.length > 0 && renderEventsGroup(checkedInEvents, 'Checked-In Events')}
        </>
      )}

      {/* Feedback Modal */}
      <Modal
        title="Submit Feedback"
        visible={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item name="eventTitle" label="Event Title">
            <Input readOnly />
          </Form.Item>
          <Form.Item name="eventDate" label="Event Date">
            <Input readOnly />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item
            name="surname"
            label="Surname"
            rules={[{ required: true, message: 'Please enter your surname' }]}
          >
            <Input placeholder="Enter your surname" />
          </Form.Item>
          <Form.Item name="timestamp" label="Date">
            <Input readOnly />
          </Form.Item>
          <Form.Item
            name="feedback"
            label="Feedback"
            rules={[{ required: true, message: 'Please enter your feedback' }]}
          >
            <Input.TextArea placeholder="Enter your feedback" rows={4} />
          </Form.Item>
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingFeedbackId ? 'Update Feedback' : 'Submit Feedback'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyEvents;
