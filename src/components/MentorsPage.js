import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from './firebaseConfig';
import MentorsCard from './MentorsCard';
import { Container, Row, Col, InputGroup, Input, InputGroupText, Button } from 'reactstrap';
import { Search, Bell } from 'lucide-react';
import './MentorsPage.css';
import MentorConnect from './MentorConnect';

const mentorsData = [
  {
    name: 'Zuha Ajlan',
    field: 'Master of Science in Medicine (Neuroscience- University of the Witwatersrand)',
    image: 'https://shadowascientist.org/IMAGE/our%20team/zuha_Ajlan.png_2-removebg-preview.png',
  },
   {
    name: 'Dr Diana Pillay',
    field: 'Doctor of Philosophy (Anatomy, Neuroanatomy,  osteoscience, micro tomography). Senior lecturer - Sefako Makgatho  Health Sciences University  ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748023928/Diana_Pillay_-_Diana_Pillay_euf8yi.jpg',
  },
    {
    name: 'Dr Upasana Ramphal ',
    field: 'Professional Scientist (Pr. Sci. Nat) with expertise in Genomics, Quality and Regulatory Compliance(BSc, BTech, MMedSc, PhD) ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748191987/5J3A9107_-_Upasana_Ramphal_nwzrdi.jpg',
  },
   {
    name: 'Noosi Iddo Raditapole',
    field: 'Master of Science in Biotechnology (University of the Witwatersrand)',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749219734/WhatsApp_Image_2025-03-06_at_18.30.21_6d1a8a1d_stdyp6.jpg',
  },
 
   {
    name: 'Clarissa Naidoo ',
    field: 'Applied chemistry, Honours degree, Currently Graduate Chemist in the mining industry  ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749219127/Screenshot_20240618_231709_Gallery_-_Clarissa_Naidoo_gbfu9x.jpg',
  },

   {
    name: 'Taanashe Simon Gahadza ',
    field: 'BSc Hons, Chemical Technology (Bindura University of Science Education)- Product and Process Chemist at Zen Oil Products.  ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748191958/FB_IMG_1745424624592_-_Taanashe_Simon_Gahadza_ia8r3v.jpg',
  },
   {
    name: 'Puleng Moloi',
    field: 'Undergraduate in Genetics and Physiology',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748024051/IMG-20250117-WA0005_-_Puleng_Moloi_1_cy4jp6.jpg',
  },
  {
    name: 'Andreas Fusi',
    field: 'Program Manager at ICAP at Columbia University.Master of Public Health',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749219925/c0d1cb9a-7c79-49f7-a96e-c484ff71e743.png',
  },
  
 
  {
    name: 'Francis Sambani',
    field: 'Bachelor of Science (Honours) in Biomedical/Medical Sciences (Malawi University of Science and Technology)',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749219833/0a952f26-6f3a-4544-8be0-36dda425ec48.png',
  },

 
  {
    name: 'Tumelo Ramaili - SAS Mentor Program  Director ',
    field: 'Postgraduate Degree in  Biotechnology (innovation research and commercialization)',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQGnDpqSgBtxZw/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1727852969341?e=1749686400&v=beta&t=fLzAm0wf2WdPEeyDMAP2_zueYIxjRZMwkmXtScfDm0c',
  },
    {
    name: 'Refeletse Malahlela',
    field: 'Honours/Post graduate diploma in Chemical Pathology ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748024055/Grad_pic_half_-_Refeletse_Malahlela_bjl2og.jpg',
  },
  {
    name:'Solomon Mahlasela',
    field:'Undergraduate in biochemistry and microbiology-Lab technologist',
    image:'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748024057/IMG_20250326_184128_2_-_Solomon_Mahlasela_dg8t8q.jpg',
  },
  {
    name: 'Kamogelo Chauke ',
    field: 'Postgraduate Diploma in Biotechnology - Founder of RiboEdge Biotech  ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749218880/IMG_0669_-_Kamogelo_Chauke_zsplph.jpg',
  },
   
    {
    name: 'Tshedisehang Moloele',
    field: 'Bachelor of Science Honors in Microbilogy, Microbiologist-Thirsti Water',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748024834/b40d8124-e06e-4eb6-8faf-f6ab9f739b68.png',
  },
    {
    name: 'Yajna Jaglal',
    field: 'Master of Science in Medical Science (University of KwaZulu Natal)',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748025318/c285a1cf-63d3-4627-9b67-cc9b99e72ab2.png',
  },
    {
    name: 'Lebogang Eureka Malesa',
    field: 'Postgraduate Diploma in Pharmaceutical Sciences ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748191962/IMG_20210624_075836_609_-_Eureka_Malesa_vtty9s.jpg',
  },
    {
    name: 'Mahloli Suzan Ratsiu ',
    field: ' Master of Science, Laboratory Field Epidemiologist ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748025443/c5375e15-86d9-416e-9473-d0c5634b0c9b.png',
  },
  
    {
    name: 'Njeodo Njongang Vigny ',
    field: 'Master of Science, Clinical Biochemistry ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748025582/5843f987-f03f-42fa-b190-223e4f2a691c.png',
  },
  
    {
    name: 'Keatlaretse Monnanyana',
    field: 'Bacholor of Science Honors in Microbiology and Biochemistry )',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748025679/52529226-28bc-4eb2-bcf4-743d8470b45b.png',
  },
  
    {
    name: 'Mxolisi Nene ',
    field: 'Master of Science in Animal genomics and bioinformatics (University of Zululand )',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748025061/a89f90ba-c49b-485e-9188-8ae9b7aca859.png',
  },
    {
    name: 'Karabo Tsoku',
    field: 'Bachelor of  Science Honors in Clinical Research',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748025208/968b6332-1825-47d3-a0f0-794bd715f44f.png',
  },
   {
    name: 'Sophia Shabalala ',
    field: 'MSc Biomedical Sciences (in progess), Product Specialist Instrument Sales ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749219346/-_Attachement_-_Profile_Photo_-_Sophia_S._1_g5wi8a.jpg',
  },

   
   {
    name: 'Tebello Aaron Serobe ',
    field: 'Veterinary and Zoology (MSc in Zoology-in progress, Associate Specialist Researcher) ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748191975/High_DA18634-074_1_-_Aaron_Serobe_r303j4.jpg',
  },
   {
    name: 'Khutso Moodlleyn Malema ',
    field: 'BHSC Medical Laboratory Sciences ( Virology)',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748191989/1S6A6931_-_Khutso_Moodlleyn_Malema_w944mb.jpg',
  },
   {
    name: 'Batsiba Rasekanye ',
    field: 'BSc in Environmental Sciences with Chemistry and Microbiology ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748191959/IMG_20241124_212453_260_-_Batsiba_Rasekanye_nrhphr.webp',
  },
 
   {
    name: 'Enya Steyn',
    field: 'BSc in Genetics and Biochemistry . Currently doing my B(Med)Sc Hons in Human Genetics',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1748191957/Linkedin_-_Enya_Steyn_mecd29.jpg',
  },
   
   
   {
    name: 'Refilwe Lotlhare ',
    field: 'Bachelor of Science in Life Sciences majoring in Biochemistry and Physiology.   ',
    image: 'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749218877/FB_IMG_1745497188445_-_Refilwe_Lotlhare_hjrzse.jpg',
  },
  {
    name:'Mpho M. Moeling',
    field:'Bsc in Chemical Technology - Assistant Plant operator',
    image:'https://res.cloudinary.com/db7fyg4z1/image/upload/v1749222054/mpo_edzgtq.jpg'
  },
     {
    name:'Tsholedi Ngoasheng',
    field:'Biochemistry, Microbiology, and Molecular biology',
    image:'https://firebasestorage.googleapis.com/v0/b/shadow-a-scientist.appspot.com/o/profileImages%2FUQxZB1fLqwdgziKaPatZ7mffDKM2?alt=media&token=b609a8b6-ed9d-4dff-874d-373d3e7b3fb2'
  },
    {
    name:'Hosea Matlebjane',
    field:'Pharmacy',
    image:'https://firebasestorage.googleapis.com/v0/b/shadow-a-scientist.appspot.com/o/profileImages%2FckN7MWIA17Wl6arl3aySMoLZA7J2?alt=media&token=3ca94901-55f6-4ef4-8ccf-4efafab37007'
  },
   {
    name:'  Nhlamulo Ntlemo',
    field:'Medical Microbiology',
    image:'https://firebasestorage.googleapis.com/v0/b/shadow-a-scientist.appspot.com/o/profileImages%2FwrWLAbGfDKfdvwQ2l34eIcVSnKo1?alt=media&token=a75e5971-3642-4bab-92f6-4babac40db16'
  },


];

const MentorsFeedbackPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [uid, setUid] = useState(null);

  // Listen for auth state changes to set the UID.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        setNotifications([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Function to mark a notification as read.
  const markAsRead = async (notif) => {
    // Determine which collection to update based on the source.
    let collectionName = notif.source ? notif.source : "notifications";
    try {
      await updateDoc(doc(db, collectionName, notif.id), {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Set up real-time listeners for notifications and requests.
  useEffect(() => {
    if (!uid) return;

    // Define queries.
    const notificationsRef = collection(db, "notifications");
    const notificationsQuery = query(
      notificationsRef,
      where("recipientId", "==", uid),
      orderBy("timestamp", "desc")
    );

    const acceptedRef = collection(db, "acceptedRequests");
    const acceptedQuery = query(
      acceptedRef,
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );

    const waitlistedRef = collection(db, "waitlistedRequests");
    const waitlistedQuery = query(
      waitlistedRef,
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );

    const rejectedRef = collection(db, "rejectedRequests");
    const rejectedQuery = query(
      rejectedRef,
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );

    const scheduledRef = collection(db, "scheduled");
    const scheduledQuery = query(
      scheduledRef,
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );

    // Local variables to store current results.
    let currentNotifications = [];
    let currentAccepted = [];
    let currentWaitlisted = [];
    let currentRejected = [];
    let currentScheduled = [];

    // Merge and update notifications state.
    const updateCombinedNotifications = () => {
      const combined = [
        ...currentNotifications,
        ...currentAccepted,
        ...currentWaitlisted,
        ...currentRejected,
        ...currentScheduled
      ];
      combined.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : a.timestamp;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : b.timestamp;
        return timeB - timeA;
      });
      setNotifications(combined);
    };

    // Listener for general notifications.
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      currentNotifications = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        type: 'notification',
        source: "notifications",
        ...docSnap.data()
      }));
      updateCombinedNotifications();
    });

    // Listener for accepted requests (includes mentorId and assistanceType).
    const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
      currentAccepted = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        type: 'feedback',
        source: "acceptedRequests",
        message: `Request ${docSnap.data().status} | Mentor ID: ${docSnap.data().mentorId} | Assistance: ${docSnap.data().assistanceType}`,
        ...docSnap.data()
      }));
      updateCombinedNotifications();
    });

    // Listener for waitlisted requests (includes mentorId and assistanceType).
    const unsubscribeWaitlisted = onSnapshot(waitlistedQuery, (snapshot) => {
      currentWaitlisted = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        type: 'feedback',
        source: "waitlistedRequests",
        message: `Request ${docSnap.data().status} | Mentor ID: ${docSnap.data().mentorId} | Assistance: ${docSnap.data().assistanceType}`,
        ...docSnap.data()
      }));
      updateCombinedNotifications();
    });

    // Listener for rejected requests (includes mentorId and assistanceType).
    const unsubscribeRejected = onSnapshot(rejectedQuery, (snapshot) => {
      currentRejected = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        type: 'feedback',
        source: "rejectedRequests",
        message: `Request ${docSnap.data().status} | Mentor ID: ${docSnap.data().mentorId} | Assistance: ${docSnap.data().assistanceType}`,
        ...docSnap.data()
      }));
      updateCombinedNotifications();
    });

    // Listener for scheduled collection.
    const unsubscribeScheduled = onSnapshot(scheduledQuery, (snapshot) => {
      currentScheduled = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const startDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        const endDate = data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate);
        // Compute the duration (in hours, for example)
        const durationHours = Math.abs(endDate - startDate) / (1000 * 60 * 60);
        return {
          id: docSnap.id,
          type: 'scheduled',
          source: "scheduled",
          message: `Scheduled on ${startDate.toLocaleString()}. Duration: ${durationHours.toFixed(1)} hours.`,
          ...data
        };
      });
      updateCombinedNotifications();
    });

    // Clean up listeners on unmount or when uid changes.
    return () => {
      unsubscribeNotifications();
      unsubscribeAccepted();
      unsubscribeWaitlisted();
      unsubscribeRejected();
      unsubscribeScheduled();
    };

  }, [uid]);

  // Toggle the notifications panel.
  const handleBellClick = () => {
    setShowNotifications(prev => !prev);
  };

  // Hide notifications panel when tapped.
  const handlePanelClick = () => {
    setShowNotifications(false);
  };

  // Helper for formatting timestamps.
  const formatTimestamp = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  // Filter mentors based on search term.
  const filteredMentors = mentorsData.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate unread notifications count (only those without read:true).
  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <Container className="mentors-container">
      <h2 className="page-title" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Meet Our Mentors
      </h2>
      
      {/* Notification Icon with animated badge.
          The badge shows count of unread notifications. */}
      <div style={{ position: 'relative', height: '40px', width: '40px', float: 'right', marginTop: '-50px' }}>
        <div className="notification-icon" onClick={handleBellClick}>
          <Bell size={24} color="black" className="bell-icon" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <div 
        className={`notifications-panel ${showNotifications ? 'show' : ''}`}
        onClick={handlePanelClick}
      >
        <h4>Notifications</h4>
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map(notif => (
              <li key={notif.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                <p>{notif.message}</p>
                <small>{notif.timestamp && formatTimestamp(notif.timestamp)}</small>
                {/* Only show the button if the notification is not read */}
                {!notif.read && (
                  <div style={{ marginTop: '5px' }}>
                    <Button 
                      size="sm" 
                      color="primary" 
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif); }}>
                      Mark as read
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search Bar */}
      <InputGroup className="search-bar" style={{ marginTop: '20px' }}>
        <InputGroupText>
          <Search size={20} />
        </InputGroupText>
        <Input
          type="text"
          placeholder="Search by name or field..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </InputGroup>

      {/* Mentors Cards */}
      <Row style={{ marginTop: '20px' }}>
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor, index) => (
            <Col sm="12" md="6" lg="4" key={index}>
              <MentorsCard mentor={mentor} />
            </Col>
          ))
        ) : (
          <p className="no-results">No mentors found.</p>
        )}
      </Row>
       <MentorConnect /> 
    </Container>
  );
};

export default MentorsFeedbackPage;
