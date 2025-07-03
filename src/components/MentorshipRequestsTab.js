import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  List,
  Spin,
  Typography,
  Button,
  Tabs,
  message,
  Select,
  Modal,
  Tag,
} from "antd";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Helper to render a color-coded status tag
const getStatusTag = (status) => {
  const colorMap = {
    Accepted: "green",
    Rejected: "red",
    Waitlisted: "orange",
  };
  if (!status) return null;
  return <Tag color={colorMap[status]}>{status}</Tag>;
};

const MentorshipRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [waitlistedRequests, setWaitlistedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(null);
  const [uid, setUid] = useState(null);
  const [mentorID, setMentorID] = useState(null);
  const [selectedStatusMap, setSelectedStatusMap] = useState({});

  // Listen for auth state changes to get the current user uid
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        console.log("No user is logged in.");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch mentorID from the user's document
  useEffect(() => {
    const fetchMentorID = async () => {
      if (!uid) return;
      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.mentorID) {
            setMentorID(userData.mentorID);
          } else {
            console.log("MentorID not found for this user.");
          }
        } else {
          console.log("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching mentor ID: ", error);
      }
    };
    fetchMentorID();
  }, [uid]);

  // Helper to fetch requests
  const fetchRequestsFromCollection = async (collectionName) => {
    if (!mentorID) return [];
    try {
      const q = query(
        collection(db, collectionName),
        where("mentorId", "==", mentorID)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  };

  // Fetch all requests
  useEffect(() => {
    if (!mentorID) return;
    const fetchAllRequests = async () => {
      setLoading(true);
      try {
        const [pending, accepted, waitlisted, rejected] = await Promise.all([
          fetchRequestsFromCollection("mentorBookings"),
          fetchRequestsFromCollection("acceptedRequests"),
          fetchRequestsFromCollection("waitlistedRequests"),
          fetchRequestsFromCollection("rejectedRequests"),
        ]);
        setRequests(pending);
        setAcceptedRequests(accepted);
        setWaitlistedRequests(waitlisted);
        setRejectedRequests(rejected);
      } catch (error) {
        console.error("Error fetching requests: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRequests();
  }, [mentorID]);

  // Update selected status
  const handleStatusChange = (requestId, value) => {
    setSelectedStatusMap((prev) => ({ ...prev, [requestId]: value }));
  };

  // Find and delete existing record
  const findAndDeleteExistingRecord = async (requestId) => {
    const collectionsToCheck = [
      "mentorBookings",
      "acceptedRequests",
      "waitlistedRequests",
      "rejectedRequests",
    ];
    for (const col of collectionsToCheck) {
      const docRef = doc(db, col, requestId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        await deleteDoc(docRef);
        return data;
      }
    }
    return null;
  };

  // Handle sending feedback
  const handleSendRequest = async (requestId) => {
    const selectedStatus = selectedStatusMap[requestId];
    if (!selectedStatus) {
      message.error("Please select a status.");
      return;
    }
    setLoadingButton({ requestId, action: selectedStatus });
    const hideMessage = message.loading("Submitting...", 0);

    try {
      const recordData = await findAndDeleteExistingRecord(requestId);
      if (!recordData) {
        hideMessage();
        message.error("Record not found.");
        return;
      }

      let targetCollection = "";
      if (selectedStatus === "Accepted") targetCollection = "acceptedRequests";
      else if (selectedStatus === "Waitlisted") targetCollection = "waitlistedRequests";
      else if (selectedStatus === "Rejected") targetCollection = "rejectedRequests";

      await setDoc(doc(db, targetCollection, requestId), {
        ...recordData,
        status: selectedStatus,
        processedAt: new Date(),
      });

      // Update local state
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setAcceptedRequests((prev) => prev.filter((r) => r.id !== requestId));
      setWaitlistedRequests((prev) => prev.filter((r) => r.id !== requestId));
      setRejectedRequests((prev) => prev.filter((r) => r.id !== requestId));

      const updatedRecord = { ...recordData, id: requestId, status: selectedStatus };
      if (selectedStatus === "Accepted") setAcceptedRequests((prev) => [...prev, updatedRecord]);
      if (selectedStatus === "Waitlisted") setWaitlistedRequests((prev) => [...prev, updatedRecord]);
      if (selectedStatus === "Rejected") setRejectedRequests((prev) => [...prev, updatedRecord]);

      hideMessage();
      message.success("Status updated ✓", 2);
    } catch (error) {
      hideMessage();
      message.error("Submission failed.");
      console.error("Error updating request status: ", error);
    } finally {
      setLoadingButton(null);
    }
  };

  // Delete pending request
  const handleDeleteRequest = (requestId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this request?",
      onOk: async () => {
        try {
          await deleteDoc(doc(db, "mentorBookings", requestId));
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
          message.success("Request deleted successfully.");
        } catch (error) {
          message.error("Failed to delete the request.");
          console.error("Error deleting request: ", error);
        }
      },
    });
  };

  // Format Firestore timestamp
  const formatTimestamp = (timestamp) => {
    if (timestamp?.toDate) return new Date(timestamp.toDate()).toLocaleString();
    if (timestamp?.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
    return "Invalid Timestamp";
  };

  return (
    <Card
      title="Mentorship Requests"
      bordered={false}
      style={{ maxWidth: "100%", overflowX: "auto" }}
    >
      <div style={{ overflowX: "auto" }}>
        <Tabs defaultActiveKey="1" type="line">
          <TabPane tab="All Requests" key="1">
            {loading ? (
              <Spin tip="Loading..." />
            ) : requests.length === 0 ? (
              <Text type="danger">No mentorship requests found for this mentor.</Text>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={requests}
                renderItem={(request) => (
                  <List.Item key={request.id}>
                    <Row gutter={[16, 16]} style={{ width: "100%" }}>
                      <Col xs={24} md={16}>
                        <List.Item.Meta
                          title={
                            <>
                              {`${request.name}'s Request for ${request.assistanceType} `}
                              {getStatusTag(request.status)}
                            </>
                          }
                          description={
                            <>
                              Field: {request.fieldOfStudy} | Year: {request.yearOfStudy} <br />
                              Mentor: {request.mentorId}
                            </>
                          }
                        />
                        <div style={{ marginTop: 8 }}>
                          <strong>Email:</strong> {request.email} <br />
                          <strong>Date:</strong> {request.date} <br />
                          <strong>Timestamp:</strong> {formatTimestamp(request.timestamp)}
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <Select
                            placeholder="Select status"
                            value={selectedStatusMap[request.id]}
                            onChange={(value) => handleStatusChange(request.id, value)}
                            style={{ width: "100%" }}
                          >
                            <Option value="Accepted">Accept</Option>
                            <Option value="Waitlisted">Waitlist</Option>
                            <Option value="Rejected">Reject</Option>
                          </Select>

                          <Button
                            type="primary"
                            onClick={() => handleSendRequest(request.id)}
                            disabled={loadingButton?.requestId === request.id}
                            block
                          >
                            {loadingButton?.requestId === request.id ? <Spin size="small" /> : "Send Feedback"}
                          </Button>

                          <Button danger onClick={() => handleDeleteRequest(request.id)} block>
                            Delete Request
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            )}
          </TabPane>

          <TabPane tab="Accepted Requests" key="2">
            <List
              itemLayout="horizontal"
              dataSource={acceptedRequests}
              renderItem={(request) => (
                <List.Item key={request.id}>
                  <List.Item.Meta
                    title={
                      <>
                        {`${request.name}'s Request for ${request.assistanceType} `}
                        {getStatusTag(request.status)}
                      </>
                    }
                    description={`Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId} | Email: ${request.email}`}

                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Waitlisted Requests" key="3">
            <List
              itemLayout="vertical"
              dataSource={waitlistedRequests}
              renderItem={(request) => (
                <List.Item key={request.id}>
                  <Row gutter={[16, 16]} style={{ width: "100%" }}>
                    <Col xs={24} md={16}>
                      <List.Item.Meta
                        title={
                          <>
                            {`${request.name}'s Request for ${request.assistanceType} `}
                            {getStatusTag(request.status)}
                          </>
                        }
                        description={`Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId} | Email: ${request.email}`}

                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <Text type="secondary">No further action available for waitlisted requests.</Text>
                    </Col>

                  </Row>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Rejected Requests" key="4">
            <List
              itemLayout="horizontal"
              dataSource={rejectedRequests}
              renderItem={(request) => (
                <List.Item key={request.id}>
                  <List.Item.Meta
                    title={
                      <>
                        {`${request.name}'s Request for ${request.assistanceType} `}
                        {getStatusTag(request.status)}
                      </>
                    }
                    description={`Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId}`}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </div>
    </Card>
  );
};

export default MentorshipRequestsTab;
