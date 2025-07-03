import React, { useEffect, useState } from "react";
import {
  Card,
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

  // Fetch mentorID from the user's document once uid is available
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

  // Helper to fetch requests from a given collection using mentorID
  const fetchRequestsFromCollection = async (collectionName) => {
    if (!mentorID) return [];
    try {
      const q = query(
        collection(db, collectionName),
        where("mentorId", "==", mentorID)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  };

  // Fetch all types of requests in parallel once mentorID is available
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

  // Update the selected status for a given request
  const handleStatusChange = (requestId, value) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  // Helper: Look for the record in all collections and delete it if found. Returns the record data if found.
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

  // Function to update a request's status (works for any request, including waitlisted ones)
  const handleSendRequest = async (requestId) => {
    const selectedStatus = selectedStatusMap[requestId];
    if (!selectedStatus) {
      message.error("Please select a status.");
      return;
    }
    setLoadingButton({ requestId, action: selectedStatus });
    const hideMessage = message.loading("Submitting...", 0);

    try {
      // Find and delete the existing record (from any collection)
      const recordData = await findAndDeleteExistingRecord(requestId);
      if (!recordData) {
        hideMessage();
        message.error("Record not found.");
        return;
      }

      // Determine target collection based on new status
      let targetCollection = "";
      if (selectedStatus === "Accepted") {
        targetCollection = "acceptedRequests";
      } else if (selectedStatus === "Waitlisted") {
        targetCollection = "waitlistedRequests";
      } else if (selectedStatus === "Rejected") {
        targetCollection = "rejectedRequests";
      }

      // Save the record to the target collection with updated status and timestamp
      await setDoc(doc(db, targetCollection, requestId), {
        ...recordData,
        status: selectedStatus,
        processedAt: new Date(),
      });

      // Remove the processed request from all local state arrays
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setAcceptedRequests((prev) => prev.filter((r) => r.id !== requestId));
      setWaitlistedRequests((prev) => prev.filter((r) => r.id !== requestId));
      setRejectedRequests((prev) => prev.filter((r) => r.id !== requestId));

      const updatedRecord = { ...recordData, id: requestId, status: selectedStatus };

      if (selectedStatus === "Accepted") {
        setAcceptedRequests((prev) => [...prev, updatedRecord]);
      } else if (selectedStatus === "Waitlisted") {
        setWaitlistedRequests((prev) => [...prev, updatedRecord]);
      } else if (selectedStatus === "Rejected") {
        setRejectedRequests((prev) => [...prev, updatedRecord]);
      }

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

  // Function to handle deletion of a pending request with a confirmation modal
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

  // Improved timestamp formatting using Firestore's toDate method if available
  const formatTimestamp = (timestamp) => {
    if (timestamp?.toDate) {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return "Invalid Timestamp";
  };

  return (
    <Card title="Mentorship Requests" bordered={false}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="All Requests" key="1">
          {loading ? (
            <Spin tip="Loading..." />
          ) : requests.length === 0 ? (
            <Text type="danger">
              No mentorship requests found for this mentor.
            </Text>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={requests}
              renderItem={(request) => (
                <List.Item key={request.id}>
                  <List.Item.Meta
                    title={
                      <>
                        {`${request.name}'s Request for ${request.assistanceType} `}
                        {getStatusTag(request.status)}
                      </>
                    }
                    description={
                      <>
                        Field: {request.fieldOfStudy} | Year:{" "}
                        {request.yearOfStudy} | Mentor: {request.mentorId}
                      </>
                    }
                  />
                  <div>
                    <strong>Email:</strong> {request.email} <br />
                    <strong>Date:</strong> {request.date} <br />
                    <strong>Timestamp:</strong>{" "}
                    {formatTimestamp(request.timestamp)}
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Select
                      placeholder="Select status"
                      value={selectedStatusMap[request.id]}
                      onChange={(value) => handleStatusChange(request.id, value)}
                      style={{ width: 150, marginRight: 10 }}
                    >
                      <Option value="Accepted">Accept</Option>
                      <Option value="Waitlisted">Waitlist</Option>
                      <Option value="Rejected">Reject</Option>
                    </Select>
                    <Button
                      type="primary"
                      onClick={() => handleSendRequest(request.id)}
                      disabled={loadingButton?.requestId === request.id}
                    >
                      {loadingButton?.requestId === request.id ? (
                        <Spin size="small" />
                      ) : (
                        "Send Feedback"
                      )}
                    </Button>
                    <Button
                      danger
                      onClick={() => handleDeleteRequest(request.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Delete Request
                    </Button>
                  </div>
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
                  description={`Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId}`}
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab="Waitlisted Requests" key="3">
          <List
            itemLayout="horizontal"
            dataSource={waitlistedRequests}
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
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Select
                    placeholder="Reconsider status"
                    value={selectedStatusMap[request.id]}
                    onChange={(value) => handleStatusChange(request.id, value)}
                    style={{ width: 150, marginRight: 10 }}
                  >
                    <Option value="Accepted">Accept</Option>
                    <Option value="Rejected">Reject</Option>
                  </Select>
                  <Button
                    type="primary"
                    onClick={() => handleSendRequest(request.id)}
                    disabled={loadingButton?.requestId === request.id}
                  >
                    {loadingButton?.requestId === request.id ? (
                      <Spin size="small" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
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
    </Card>
  );
};

export default MentorshipRequestsTab;
