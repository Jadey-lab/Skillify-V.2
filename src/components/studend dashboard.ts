import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Typography, Button, Table, Spin, Grid, Avatar, Dropdown, Menu, Select } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import html2canvas from 'html2canvas';
import CareersWidget from './CareersWidget';
import RSSFeedWidget from './RSSFeedWidget';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import app from './firebaseconfig2';
import certImage from '../images/cert.png';

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

// Achievement levels array
const achievementLevels = [
  { threshold: 10, level: "Visionary Scientist", color: "#D32F2F" },
  { threshold: 9, level: "Master of Discovery", color: "#F57C00" },
  { threshold: 8, level: "Pioneering Researcher", color: "#9C27B0" },
  { threshold: 7, level: "Scientific Scholar", color: "#1976D2" },
  { threshold: 6, level: "Emerging Scientist", color: "#388E3C" },
  { threshold: 5, level: "Innovative Thinker", color: "#FBC02D" },
  { threshold: 4, level: "Aspiring Researcher", color: "#0288D1" },
  { threshold: 3, level: "Science Enthusiast", color: "#E91E63" },
  { threshold: 2, level: "Lab Explorer", color: "#00796B" },
  { threshold: 1, level: "Curious Observer", color: "#00BCD4" },
];

const getAchievementLevel = (totalAttended) => {
  for (let i = 0; i < achievementLevels.length; i++) {
    if (totalAttended >= achievementLevels[i].threshold) {
      return achievementLevels[i];
    }
  }
  return { level: "No Achievement Yet", color: "#000" };
};

//
// Student Bio Card Component
//
const StudentBioCard = ({ profile, totalAttended }) => {
  const [uid, setUid] = useState(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Card
      style={{
        margin: '16px auto',
        maxWidth: '600px',
        width: '95%',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Row align="middle" style={{ padding: '16px' }} gutter={[16, 16]}>
        {/* Avatar Column */}
        <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
          <Avatar
            size={100}
            src={profile?.profileImages || 'default-profile.png'}
            alt="Profile"
          />
        </Col>

        {/* Info Column */}
        <Col xs={24} sm={18}>
          <Title
            level={3}
            style={{ margin: 0, fontSize: isMobile ? '18px' : undefined }}
          >
            {profile?.firstName} {profile?.surname}
          </Title>

          <Text
            type="secondary"
            style={{ fontSize: isMobile ? '14px' : '20px' }}
          >
            {profile?.fieldOfStudy || 'Your Subtitle Here'}
          </Text>

          {/* UID from Auth */}
          {uid && (
            <Text
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#888',
                marginTop: 4,
                wordBreak: 'break-all',
                maxWidth: '100%',
              }}
            >
               {uid}
            </Text>
          )}

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={8} style={{ textAlign: 'center' }}>
              <Title
                level={5}
                style={{ margin: 0, fontSize: isMobile ? '11px' : undefined }}
              >
                Field
              </Title>
              <Text style={{ fontSize: isMobile ? '11px' : undefined }}>
                {profile?.fieldOfStudy || '-'}
              </Text>
            </Col>

            <Col xs={8} style={{ textAlign: 'center' }}>
              <Title
                level={5}
                style={{ margin: 0, fontSize: isMobile ? '11px' : undefined }}
              >
                Institution
              </Title>
              <Text style={{ fontSize: isMobile ? '11px' : undefined }}>
                {profile?.education || '-'}
              </Text>
            </Col>

            <Col xs={8} style={{ textAlign: 'center' }}>
              <Title
                level={5}
                style={{ margin: 0, fontSize: isMobile ? '11px' : undefined }}
              >
                Attended
              </Title>
              <Text style={{ fontSize: isMobile ? '11px' : undefined }}>
                {totalAttended}
              </Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

//
// Certification Display Component with Download Option and Event Selector
//
const CertificationDisplay = ({ profile, totalAttended, attendedEvents }) => {
  const achievement = getAchievementLevel(totalAttended);
  const certRef = useRef(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [selectedEvent, setSelectedEvent] = useState(null);

  // When attendedEvents updates, set the default selected event to the first one
  useEffect(() => {
    if (attendedEvents && attendedEvents.length > 0) {
      setSelectedEvent(attendedEvents[0]);
    }
  }, [attendedEvents]);

  // Download certificate as PNG function
  const downloadCertificate = async () => {
    if (certRef.current) {
      const canvas = await html2canvas(certRef.current, {
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'certificate.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // Dropdown menu for certificate download
  const menu = (
    <Menu>
      <Menu.Item key="download" onClick={downloadCertificate}>
        Download Certificate
      </Menu.Item>
    </Menu>
  );

  const certificateStyle = {
    borderRadius: '8px',
    padding: isMobile ? '12px' : '16px',
    backgroundImage: `url(${certImage})`,
    backgroundSize: '100% 100%', // stretches image to fill entire container
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    color: '#333',
    textAlign: 'center',
    margin: '0 auto',
    width: '100%',
    height: '100%', // make sure parent has a defined height
  };

  // Render a selector if the user attended more than one event
  const eventSelector = attendedEvents && attendedEvents.length > 1 && (
    <div style={{ marginBottom: 12, textAlign: 'center' }}>
      <Text strong>Select Certificate for:</Text>
      <Select
        style={{ marginLeft: 8, width: 300 }}
        value={selectedEvent?.id}
        onChange={(value) => {
          const event = attendedEvents.find(e => e.id === value);
          setSelectedEvent(event);
        }}
      >
        {attendedEvents.map(event => (
          <Option key={event.id} value={event.id}>
            {event.eventTitle} - {new Date(event.eventDate).toLocaleDateString()}
          </Option>
        ))}
      </Select>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
    {/* Three dots icon as pop-up trigger for download */}
    <Dropdown overlay={menu} trigger={['click']}>
      <Button
        type="text"
        icon={<MoreOutlined style={{ fontSize: isMobile ? 18 : 20, color: '#333' }} />}
        style={{
          position: 'absolute',
          top: isMobile ? 8 : 12,
          right: isMobile ? 8 : 12,
          zIndex: 1,
        }}
      />
    </Dropdown>
    {eventSelector}
  
    <Card
      ref={certRef}
      style={{
        marginBottom: 12,
        padding: isMobile ? 12 : 16,
        textAlign: 'center',
        maxWidth: isMobile ? 320 : 500,
        margin: '0 auto',
        ...certificateStyle,
      }}
    >
      {selectedEvent?.eventTitle ? (
        <>
          <Title
            level={isMobile ? 4 : 3}
            style={{
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              marginBottom: 8,
              fontSize: isMobile ? '18px' : '20px',
            }}
          >
            Certificate of Achievement
          </Title>
          <Text
            strong
            style={{
              display: 'block',
              fontFamily: 'Merriweather',
              fontSize: isMobile ? '14px' : '16px',
              marginBottom: 12,
            }}
          >
            Awarded to:
            <br />
            <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 700 }}>
              {profile?.firstName} {profile?.surname}
            </span>
          </Text>
  
          <Title
            level={isMobile ? 6 : 5}
            style={{
              fontFamily: 'Playfair Display',
              fontWeight: 600,
              margin: '8px 0 12px',
              fontSize: isMobile ? '14px' : '16px',
            }}
          >
            For successfully attending:
          </Title>
          <Text
            style={{
              fontFamily: 'Merriweather',
              fontSize: isMobile ? '14px' : '16px',
              marginBottom: 8,
              display: 'block',
              fontWeight: 700,
            }}
          >
            {selectedEvent.eventTitle}
          </Text>
          <Text
            style={{
              fontFamily: 'Merriweather',
              fontSize: isMobile ? '14px' : '16px',
              marginBottom: 8,
              display: 'block',
              fontWeight: 700,
            }}
          >
            Shadow A Scientist
          </Text>
          <Text
            style={{
              fontFamily: 'Lato',
              fontSize: isMobile ? '12px' : '14px',
              marginTop: 8,
              display: 'block',
            }}
          >
            Date: {new Date(selectedEvent.eventDate).toLocaleDateString()}
          </Text>
        </>
      ) : (
        <Text
          style={{
            fontFamily: 'Merriweather',
            fontSize: isMobile ? '14px' : '16px',
            display: 'block',
            fontWeight: 500,
            color: '#999',
            marginTop: 20,
          }}
        >
          You haven't attended any event yet.
        </Text>
      )}
    </Card>
  </div>
  
  );
};

//
// Main StudentDashboard Component
//
const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [studySessions, setStudySessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [totalAttended, setTotalAttended] = useState(0);
  const [attendedEvents, setAttendedEvents] = useState([]);

  // New state for NASA APOD API
  const [apod, setApod] = useState(null);
  const [apodLoading, setApodLoading] = useState(true);
  // New state for toggling the NASA explanation
  const [nasaExpanded, setNasaExpanded] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Fetch upcoming events from Google Calendar
  const fetchEvents = async () => {
    const apiKey = "AIzaSyDmiqEIZl5XSRBHwGIrPPNnJ9GP9xpvQgQ";
    const calendarId = "339cfbd36865c5e9b75afbe1c32c9c9753214d0974c3230f8400d412de937e88@group.calendar.google.com";
    const maxResults = 2;
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const eventsData = data.items || [];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch study sessions and user profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const sessionsSnapshot = await getDocs(
            collection(db, "userprogress", user.uid, "studySessions")
          );
          const sessions = sessionsSnapshot.docs.map(doc => ({
            key: doc.id,
            ...doc.data(),
          }));
          setStudySessions(sessions);

          const userRef = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            let userData = userSnapshot.data();
            try {
              const imageRef = ref(storage, `profileImages/${user.uid}`);
              const imageUrl = await getDownloadURL(imageRef);
              userData.profileImages = imageUrl;
            } catch (imgError) {
              console.error("Error fetching profile image:", imgError);
              userData.profileImages = "default-profile.png";
            }
            setProfile(userData);
          } else {
            console.error("No user data found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching study sessions or user data:", error);
        } finally {
          setLoadingSessions(false);
          setLoadingProfile(false);
        }
      } else {
        setUserId(null);
        setStudySessions([]);
        setLoadingSessions(false);
        setLoadingProfile(false);
      }
    });

    fetchEvents();

    return () => unsubscribe();
  }, []);

  // Fetch attendance data and group events by month
  useEffect(() => {
    if (userId) {
      const fetchAttendanceData = async () => {
        try {
          const attendanceQuery = query(
            collection(db, "myevents"),
            where("uid", "==", userId)
          );
          const querySnapshot = await getDocs(attendanceQuery);
          const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Filter events with attended === true
          const attended = eventsData.filter(event => event.attended === true);
          setTotalAttended(attended.length);
          setAttendedEvents(attended);
        } catch (error) {
          console.error("Error fetching attendance events:", error);
        }
      };
      fetchAttendanceData();
    }
  }, [userId]);

  // Fetch NASA Astronomy Picture of the Day (APOD)
  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=epFQ8L8n8U2ZS4TLFO1JfqaXpeMLqxA8CTwk4kXO');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setApod(data);
      } catch (error) {
        console.error("Error fetching NASA APOD data:", error);
      } finally {
        setApodLoading(false);
      }
    };
    fetchAPOD();
  }, []);

  // Toggle function for NASA explanation
  const toggleNasaReadMore = () => {
    setNasaExpanded(!nasaExpanded);
  };

  // Calculate study session statistics
  const totalStudyTime = studySessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0
  ) / 60;
  const averageSessionDuration = studySessions.length > 0 ? totalStudyTime / studySessions.length : 0;

  const chartLabels = studySessions.map(session => {
    if (session.timestamp?.seconds) {
      return new Date(session.timestamp.seconds * 1000).toLocaleDateString();
    }
    return new Date(session.timestamp).toLocaleDateString();
  });
  const chartDurations = studySessions.map(session => (session.duration || 0) / 60);

  const sessionChartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Session Duration (min)',
      data: chartDurations,
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      fill: false,
    }],
  };

  const sessionColumns = [
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => {
        let date = timestamp?.seconds 
          ? new Date(timestamp.seconds * 1000).toLocaleString() 
          : new Date(timestamp).toLocaleString();
        return date;
      },
    },
    {
      title: 'Duration (min)',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (duration / 60).toFixed(1),
    },
  ];

  const opportunityRows = [
    { key: 1, col1: 'Microbiology Lab Shadowing', col2: 'TBD', col3: 'Unavailable' },
    { key: 2, col1: 'Chemistry Lab Shadowing', col2: 'TBD', col3: 'Unavailable' },
    { key: 3, col1: 'Biochemistry Lab Shadowing', col2: 'TBD', col3: 'Unavailable' },
  ];
  const opportunityColumns = [
    { title: 'Opportunity', dataIndex: 'col1', key: 'col1' },
    { title: 'Date', dataIndex: 'col2', key: 'col2' },
    { title: 'Status', dataIndex: 'col3', key: 'col3' },
  ];

  // Featured Events Widget
  const featuredEventsWidget = (
    <Card title="Featured Events" style={{ marginBottom: 16 }}>
      {loadingEvents ? (
        <Spin tip="Loading events..." />
      ) : events.length === 0 ? (
        <Text>No upcoming events.</Text>
      ) : (
        events.map((event, index) => {
          const date = new Date(event.start.dateTime || event.start.date).toLocaleDateString();
          const time = new Date(event.start.dateTime || event.start.date)
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const titleText = event.summary || 'No Title';
          const location = event.location || 'Location TBC';
          return (
            <Card key={index} type="inner" style={{ marginBottom: 8 }}>
              <Title level={5}>{titleText}</Title>
              <Text>{date} at {time}</Text>
              <br />
              <Text>{location}</Text>
            </Card>
          );
        })
      )}
    </Card>
  );

  // NASA APOD Widget with Read More functionality
  const nasaWidget = (
    <Card title="NASA Astronomy Picture of the Day" style={{ marginBottom: 16, width: '100%' }}>
      {apodLoading ? (
        <Spin tip="Loading NASA data..." />
      ) : apod ? (
        <>
          <Title level={5}>{apod.title}</Title>
          <img 
            src={apod.url} 
            alt={apod.title} 
            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', marginBottom: 8 }}
          />
          <Text>{new Date(apod.date).toLocaleDateString()}</Text>
          <br />
          {nasaExpanded ? (
            <Text>{apod.explanation}</Text>
          ) : (
            <Text>{apod.explanation.substring(0, 150)}...</Text>
          )}
          <br />
          <Text 
            onClick={toggleNasaReadMore} 
            style={{ cursor: 'pointer', color: '#1890ff', fontSize: 12 }}
          >
            {nasaExpanded ? 'Show less ' : 'Read more'}
          </Text>
        </>
      ) : (
        <Text>Unable to fetch NASA data.</Text>
      )}
    </Card>
  );

  const jobShadowingWidget = (
    <Card title="Upcoming Job Shadowing Opportunities" style={{ marginBottom: 16 }}>
      <Table 
        dataSource={opportunityRows} 
        columns={opportunityColumns} 
        pagination={{ pageSize: 3 }} 
        size="small"
      />
      <Button type="primary" style={{ marginTop: 16 }}>
        View More Opportunities
      </Button>
    </Card>
  );

  const studySummaryWidget = (
    <Card title="Study Session Summary" style={{ marginBottom: 16 }}>
      {loadingSessions ? (
        <Spin tip="Loading study sessions..." />
      ) : studySessions.length === 0 ? (
        <Text>No study sessions recorded.</Text>
      ) : (
        <>
          <Text>Total Study Sessions: {studySessions.length}</Text>
          <br />
          <Text>Total Study Time: {totalStudyTime.toFixed(1)} minutes</Text>
          <br />
          <Text>Average Session Duration: {averageSessionDuration.toFixed(1)} minutes</Text>
        </>
      )}
    </Card>
  );

  const studyTrackerWidget = (
    <Card title="Study Session Progress Tracker" style={{ marginBottom: 16 }}>
      {loadingSessions ? (
        <Spin tip="Loading study sessions..." />
      ) : studySessions.length === 0 ? (
        <Text>No study sessions recorded.</Text>
      ) : (
        <Table 
          dataSource={studySessions} 
          columns={sessionColumns} 
          pagination={{ pageSize: 5 }} 
          size="small"
        />
      )}
    </Card>
  );

  const sessionChartWidget = (
    <Card title="Session Durations Over Time" style={{ marginBottom: 16 }}>
      {loadingSessions ? (
        <Spin tip="Loading chart..." />
      ) : studySessions.length === 0 ? (
        <Text>No data to display.</Text>
      ) : (
        <Line data={sessionChartData} />
      )}
    </Card>
  );

  // Render for mobile: Use Swiper for the top cards and other widgets
  if (isMobile) {
    return (
      <div style={{ padding: 16 }}>
        {loadingProfile ? (
          <Spin tip="Loading profile..." />
        ) : (
          <Swiper spaceBetween={10} slidesPerView={1}>
            <SwiperSlide>
              <StudentBioCard profile={profile} totalAttended={totalAttended} />
            </SwiperSlide>
            <SwiperSlide>
              <CertificationDisplay 
                profile={profile} 
                totalAttended={totalAttended} 
                attendedEvents={attendedEvents} 
              />
            </SwiperSlide>
          </Swiper>
        )}
     <Swiper spaceBetween={10} slidesPerView={1}>
  {/* <SwiperSlide>{jobShadowingWidget}</SwiperSlide> */} {/* Removed */}
  <SwiperSlide>{nasaWidget}</SwiperSlide>
  <SwiperSlide>{featuredEventsWidget}</SwiperSlide>
  <SwiperSlide>
    <CareersWidget />
  </SwiperSlide>
  <SwiperSlide>
    <RSSFeedWidget />
  </SwiperSlide>
  <SwiperSlide>{studySummaryWidget}</SwiperSlide>
  <SwiperSlide>{studyTrackerWidget}</SwiperSlide>
  <SwiperSlide>{sessionChartWidget}</SwiperSlide>

  
</Swiper>
      </div>
    );
  }

  // Render for desktop
  return (
    <div style={{ padding: 24 }}>
      {loadingProfile ? (
        <Spin tip="Loading profile..." />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <StudentBioCard profile={profile} totalAttended={totalAttended} />
          </Col>
          <Col xs={24} sm={12}>
            <CertificationDisplay 
              profile={profile} 
              totalAttended={totalAttended} 
              attendedEvents={attendedEvents} 
            />
          </Col>
        </Row>
      )}
      
      <br></br>
      {/* New row for NASA and Featured Events widgets side by side */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          {nasaWidget}
        </Col>
        <Col xs={24} md={12}>
          {featuredEventsWidget}
        </Col>
      </Row>
        {/* Careers in STEM */}
        <Row gutter={[16,16]} style={{ marginTop: 32 }}>
        <Col xs={24}>
          <CareersWidget />
        </Col>
      </Row>
      <br></br>
      <Row gutter={[16, 16]}>
  <Col xs={24} md={12}>
    <RSSFeedWidget />
  </Col>
</Row>
<br></br>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          {studySummaryWidget}
        </Col>
        <Col xs={24} md={12}>
          {studyTrackerWidget}
        </Col>
        <Col xs={24}>
          {sessionChartWidget}
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
