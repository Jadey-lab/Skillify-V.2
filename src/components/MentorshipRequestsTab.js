import React, { useEffect, useState } from "react";
import { Card, Tabs, Spin, Typography, Button, message } from "antd";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, doc, getDoc, setDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import RequestList from "./RequestList";
import MessageHistoryList from "./MessageHistoryList";
import SendMessageModal from "./SendMessageModal";
import { formatTimestamp } from "./utils";

const { Text } = Typography;
const { TabPane } = Tabs;

const MentorshipRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [waitlistedRequests, setWaitlistedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [mentorID, setMentorID] = useState(null);
  const [uid, setUid] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
  }, []);

  useEffect(() => {
    if (!uid) return;
    const getMentorID = async () => {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setMentorID(snap.data().mentorID);
    };
    getMentorID();
  }, [uid]);

  const fetchRequests = async (collectionName) => {
    const q = query(collection(db, collectionName), where("mentorId", "==", mentorID));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  const fetchAllRequests = async () => {
    const [pending, accepted, waitlisted, rejected] = await Promise.all([
      fetchRequests("mentorBookings"),
      fetchRequests("acceptedRequests"),
      fetchRequests("waitlistedRequests"),
      fetchRequests("rejectedRequests"),
    ]);
    setRequests(pending);
    setAcceptedRequests(accepted);
    setWaitlistedRequests(waitlisted);
    setRejectedRequests(rejected);
  };

  const fetchRecipients = async () => {
    const [acceptedSnap, waitlistedSnap] = await Promise.all([
      getDocs(query(collection(db, "acceptedRequests"), where("mentorId", "==", mentorID))),
      getDocs(query(collection(db, "waitlistedRequests"), where("mentorId", "==", mentorID))),
    ]);

    const all = [...acceptedSnap.docs, ...waitlistedSnap.docs].map((d) => ({
      id: d.id,
      email: d.data().email,
      name: d.data().name,
    }));

    const unique = Array.from(new Map(all.map((u) => [u.email, u])).values());
    setRecipients(unique);
  };

  const fetchMessages = async () => {
    const q = query(collection(db, "mentorMessages"), where("mentorId", "==", mentorID));
    const snap = await getDocs(q);
    setSentMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (!mentorID) return;
    (async () => {
      setLoading(true);
      await fetchAllRequests();
      await fetchRecipients();
      await fetchMessages();
      setLoading(false);
    })();
  }, [mentorID]);

  return (
    <Card title="Mentorship Requests">
      <Tabs defaultActiveKey="1">
        <TabPane tab="All Requests" key="1">
          {loading ? <Spin /> : <RequestList data={requests} setAcceptedRequests={setAcceptedRequests} setWaitlistedRequests={setWaitlistedRequests} setRejectedRequests={setRejectedRequests} setRequests={setRequests} />}
        </TabPane>
        <TabPane tab="Accepted Requests" key="2">
          <RequestList data={acceptedRequests} readonly />
        </TabPane>
        <TabPane tab="Waitlisted Requests" key="3">
          <RequestList data={waitlistedRequests} readonly />
        </TabPane>
        <TabPane tab="Rejected Requests" key="4">
          <RequestList data={rejectedRequests} readonly />
        </TabPane>
        <TabPane tab="Send Message" key="5">
          <Button type="primary" onClick={() => setModalVisible(true)}>Compose Message</Button>
          <SendMessageModal
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            recipients={recipients}
            mentorId={mentorID}
            onMessageSent={fetchMessages}
          />
        </TabPane>
        <TabPane tab="Message History" key="6">
          <MessageHistoryList messages={sentMessages} />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default MentorshipRequestsTab;
