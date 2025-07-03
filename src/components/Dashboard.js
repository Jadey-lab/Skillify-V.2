import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Typography, Button, Table, Spin, Grid, Avatar, Dropdown, Menu,Tag, Select } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import html2canvas from 'html2canvas';
import CareersWidget from './CareersWidget';
import RSSFeedWidget from './RSSFeedWidget';
import { Modal } from 'antd';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';


import { motion, AnimatePresence } from "framer-motion";


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
import { Center } from '@chakra-ui/react';

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
const uid = auth.currentUser?.uid;;

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
const ChapterTabsGrid = () => {
  const { chapterId } = useParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const chapters = [
    { id: "nwu", name: "NWU SAS" },
    { id: "lesotho", name: "International - Lesotho" },
    { id: "kenya", name: "International - Kenya" },
  ];

  const [activeTab, setActiveTab] = useState(chapters[0].id);

  const contentSections = [
    {
      title: "Events",
      path: "events",
      subtitle: "Keep updated on what's happening in your chapter.",
      image:
        "https://images.pexels.com/photos/5427682/pexels-photo-5427682.jpeg",
    },
    {
      title: "Gallery",
      path: "gallery",
      subtitle: "View photos and videos captured by the chapter.",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=60",
    },
    {
      title: "Highlights",
      path: "highlights",
      subtitle: "Catch up on the best moments and achievements.",
      image:
        "https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg",
    },
    {
      title: "Resources",
      path: "resources",
      subtitle: "Access important documents and study materials.",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=60",
    },
  ];

  return (
    <div style={{ margin: "0 auto", padding: 20, maxWidth: 1200 }}>
      {/* Chapter tabs */}
      <div
        className="chapter-tabs-buttons"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 20,
          gap: 10,
          position: "relative",
        }}
      >
        {chapters.map((chapter) => (
          <motion.button
            key={chapter.id}
            onClick={() =>
              setActiveTab((prev) => (prev === chapter.id ? null : chapter.id))
            }
            className="relative px-4 py-2 font-medium text-sm"
            style={{
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 500,
              position: "relative",
              background: "transparent",
              border: "1px solid #ccc",
              cursor: "pointer",
              overflow: "hidden",
            }}
          >
            {activeTab === chapter.id && (
              <motion.div
                layoutId="activeSquircle"
                className="z-[-1]"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                  backgroundColor: "#3b82f6",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <span
              style={{
                color: activeTab === chapter.id ? "white" : "#333",
                position: "relative",
                zIndex: 10,
              }}
            >
              {chapter.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Content sections */}
      <AnimatePresence mode="wait">
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Title
              level={3}
              style={{
                textAlign: "center",
                fontSize: isMobile ? "16px" : "22px",
                marginBottom: 30,
              }}
            >
              {chapters.find((c) => c.id === activeTab)?.name}
            </Title>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 20,
              }}
            >
              {contentSections.map(({ title, path, image, subtitle }) => (
                <Link
                  key={title}
                  to={`/chapter/${activeTab}/${path}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      position: "relative",
                      backgroundImage: `url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: 10,
                      padding: 20,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      transition: "0.3s",
                      minHeight: 160,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      color: "white",
                      overflow: "hidden",
                    }}
                  >
                    {/* Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        borderRadius: 10,
                        zIndex: 0,
                      }}
                    />

                    {/* Text Content */}
                    <div style={{ position: "relative", zIndex: 10 }}>
                      <Title
                        level={4}
                        style={{
                          marginBottom: 4,
                          fontSize: isMobile ? "14px" : "18px",
                          color: "white",
                        }}
                      >
                        {title}
                      </Title>

                      {subtitle && (
                        <Text
                          style={{
                            fontSize: isMobile ? "11px" : "13px",
                            color: "rgba(255, 255, 255, 0.75)",
                            marginBottom: 6,
                          }}
                        >
                          {subtitle}
                        </Text>
                      )}

                      {chapterId && (
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "12px",
                            color: "rgba(255, 255, 255, 0.85)",
                          }}
                        >
                          Explore {title.toLowerCase()} for the{" "}
                          {chapterId.toUpperCase()} chapter.
                        </Text>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

//
const modalRoot = document.getElementById("modal-root") || (() => {
  const el = document.createElement("div");
  el.id = "modal-root";
  document.body.appendChild(el);
  return el;
})();

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const StudentBioCard = ({ profile, totalAttended }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    // Close modal on ESC key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openModal = () => {
    if (isDesktop) setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  // Collapsed avatar button fixed top-right on desktop
  const AvatarToggleButton = (
    <div
      onClick={openModal}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") openModal();
      }}
      style={{
        position: "fixed",
        top: 75,
        right: 20,
        zIndex: 1000,
        cursor: "pointer",
        userSelect: "none",
        textAlign: "center",
        width: 80,
        height: 80,
        background: "white",
        borderRadius: "50%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        display: isOpen ? "none" : "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      aria-label="Open student profile"
      aria-expanded={false}
    >
      <Avatar
        size={64}
        src={profile?.profileImages || "default-profile.png"}
        style={{
          border: "2px solid white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );

  // Modal content with framer-motion animation
  const ModalContent = createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()} // prevent modal close when clicking inside
            style={{ zIndex: 1100, width: 320, borderRadius: 12, overflow: "hidden" }}
          >
            <Card
              bodyStyle={{ padding: 16, paddingTop: 0 }}
              bordered={false}
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                borderRadius: 12,
                backgroundColor: "white",
              }}
            >
              {/* Banner */}
              <div
                style={{
                  height: 80,
                  marginLeft:-20,
                  width:500,
                  backgroundImage:
                    'url("https://images.pexels.com/photos/3735769/pexels-photo-3735769.jpeg")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* Avatar */}
              <div style={{ textAlign: "center", marginTop: -32 }}>
                <Avatar
                  size={64}
                  src={profile?.profileImages || "default-profile.png"}
                  style={{
                    border: "2px solid white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                />
              </div>

              {/* Name and Info */}
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {profile?.firstName} {profile?.surname}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {profile?.fieldOfStudy || "No field specified"}
                </Text>
                <br />
                <Tag color="blue" style={{ marginTop: 4 }}>
                  Student
                </Tag>
              </div>

              {/* Stats */}
              <Row gutter={16} style={{ marginTop: 16, textAlign: "center" }}>
                <Col span={8}>
                   <Text type="secondary" style={{ fontSize: '12px' }}>
                   UID: {uid}
                 </Text>
                  <br />
                  <Text strong style={{ fontSize: 13 }}>
                    {profile?.Uid || "–"}
                  </Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Events
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 13 }}>{totalAttended || 0}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Institution
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 13 }}>
                    {profile?.education ? profile.education.split(" ")[0] : "–"}
                  </Text>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    modalRoot
  );

  if (!isDesktop) {
    // On mobile: just show full card inline
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <Card
          style={{
            width: 320,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: 0,
          }}
          bodyStyle={{ padding: 16, paddingTop: 0 }}
          bordered={false}
        >
          {/* Banner */}
          <div
            style={{
              height: 80,
              backgroundImage:
                'url("https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Avatar */}
          <div style={{ textAlign: "center", marginTop: -32 }}>
            <Avatar
              size={64}
              src={profile?.profileImages || "default-profile.png"}
              style={{
                border: "2px solid white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            />
          </div>

          {/* Name and Info */}
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <Title level={5} style={{ marginBottom: 0 }}>
              {profile?.firstName} {profile?.surname}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {profile?.fieldOfStudy || "No field specified"}
            </Text>
            <br />
            <Tag color="blue" style={{ marginTop: 4 }}>
              Student
            </Tag>
          </div>

          {/* Stats */}
          <Row gutter={16} style={{ marginTop: 16, textAlign: "center" }}>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                UID  {uid}
              </Text>
              <br />
              <Text strong style={{ fontSize: 13 }}>
                {profile?.uid || "–"}
              </Text>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Events
              </Text>
              <br />
              <Text strong style={{ fontSize: 13 }}>{totalAttended || 0}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Institution
              </Text>
              <br />
              <Text strong style={{ fontSize: 13 }}>
                {profile?.education ? profile.education.split(" ")[0] : "–"}
              </Text>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  return (
    <>
      {AvatarToggleButton}
      {ModalContent}
    </>
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
    <div style={{ padding: 16, maxHeight: '100vh', overflowY: 'auto' }}>
      {loadingProfile ? (
        <Spin tip="Loading profile..." />
      ) : (
        <Swiper
          spaceBetween={10}
          slidesPerView={1}
          loop={false}
          resistanceRatio={0}
          touchReleaseOnEdges={true}
          autoHeight={true}
        >
          <SwiperSlide>
            <div style={{ marginTop: 32 }}>
              <StudentBioCard profile={profile} totalAttended={totalAttended} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <ChapterTabsGrid />
          </SwiperSlide>
        </Swiper>
      )}

      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        loop={false}
        resistanceRatio={0}
        touchReleaseOnEdges={true}
        autoHeight={true}
        style={{ marginTop: 24 }}
      >
        <SwiperSlide>{nasaWidget}</SwiperSlide>
        <SwiperSlide>{featuredEventsWidget}</SwiperSlide>
        <SwiperSlide>
          <RSSFeedWidget />
        </SwiperSlide>
        <SwiperSlide>
          <CertificationDisplay
            profile={profile}
            totalAttended={totalAttended}
            attendedEvents={attendedEvents}
          />
        </SwiperSlide>
        <SwiperSlide>
          <CareersWidget />
        </SwiperSlide>
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
<Row gutter={[16, 16]} >
  <Col xs={24} sm={12}>
    <StudentBioCard profile={profile} totalAttended={totalAttended} />
  </Col>
</Row>
      )}
      
      <br></br>
<Row gutter={[16, 16]} style={{ marginTop: 32 }}>
  <Col xs={24}>
    <ChapterTabsGrid />
  </Col>
</Row>
    {/* Careers in STEM */}
        <Row gutter={[16,16]} style={{ marginTop: 32 }}>
        <Col xs={24}>
         { <CareersWidget />}
        </Col>
      </Row>
      {/* New row for NASA and Featured Events widgets side by side */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          {nasaWidget}
        </Col>
         <Col xs={24} md={12}>
       <RSSFeedWidget />
      </Col>
      
      <br></br>
      </Row>
       <Row gutter={[16, 16]}>
     
      <Col xs={24} md={12}>
          {featuredEventsWidget}
        </Col>
      
           
        <Col xs={24} sm={12}>
            <CertificationDisplay 
              profile={profile} 
              totalAttended={totalAttended} 
              attendedEvents={attendedEvents} 
            />
          </Col>
       </Row>
  
       
      <br></br>
      <Row gutter={[16, 16]}>
  
</Row>
<br></br>
      
    </div>
  );
};

export default StudentDashboard;
