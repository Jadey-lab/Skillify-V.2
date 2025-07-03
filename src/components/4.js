import React, { useEffect, useState } from "react";
import { Card, List, Spin, Typography, Button, Tabs, message, Select } from "antd";
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

const MentorshipRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);
  const [mentorID, setMentorID] = useState(null);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [waitlistedRequests, setWaitlistedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  // Tracks the currently processing request (for button loading)
  const [loadingButton, setLoadingButton] = useState(null); // { requestId, action }
  // Stores the selected status per request id
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

  // Fetch all mentorship requests for this mentor
  useEffect(() => {
    const fetchRequests = async () => {
      if (!mentorID) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "mentorBookings"),
          where("mentorId", "==", mentorID)
        );
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching mentorship requests: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [mentorID]);

  // Update the selected status for a given request
  const handleStatusChange = (requestId, value) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  // Function to send the request action to a new collection
  const handleSendRequest = async (requestId) => {
    const selectedStatus = selectedStatusMap[requestId];
    if (!selectedStatus) {
      message.error("Please select a status.");
      return;
    }
    setLoadingButton({ requestId, action: selectedStatus });
    const hideMessage = message.loading("Submitting...", 0);

    try {
      const requestRef = doc(db, "mentorBookings", requestId);
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) return;

      // Save the action to a new collection: "mentorRequestActions"
      const actionDocRef = doc(db, "mentorRequestActions", requestId);
      await setDoc(actionDocRef, {
        status: selectedStatus,
        requestId: requestId,
        timestamp: new Date(),
      });

      // Optionally, remove the original request if Rejected
      if (selectedStatus === "Rejected") {
        await deleteDoc(requestRef);
        setRejectedRequests((prev) => [
          ...prev,
          { ...requestDoc.data(), id: requestId },
        ]);
      } else if (selectedStatus === "Accepted") {
        setAcceptedRequests((prev) => [
          ...prev,
          { ...requestDoc.data(), id: requestId },
        ]);
      } else if (selectedStatus === "Waitlisted") {
        setWaitlistedRequests((prev) => [
          ...prev,
          { ...requestDoc.data(), id: requestId },
        ]);
      }

      // Remove the processed request from the main list and clear its selected status
      setRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
      setSelectedStatusMap((prev) => {
        const newMap = { ...prev };
        delete newMap[requestId];
        return newMap;
      });

      hideMessage();
      message.success("Submitted ✓", 2);
    } catch (error) {
      hideMessage();
      message.error("Submission failed.");
      console.error("Error sending request action: ", error);
    } finally {
      setLoadingButton(null);
    }
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
                    title={${request.name}'s Request for ${request.assistanceType}}
                    description={Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId}}
                  />
                  <div>
                    <strong>Email:</strong> {request.email} <br />
                    <strong>Date:</strong> {request.date} <br />
                    <strong>Timestamp:</strong>{" "}
                    {new Date(request.timestamp.seconds * 1000).toLocaleString()}
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
                      onChange={(value) =>
                        handleStatusChange(request.id, value)
                      }
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
                  title={${request.name}'s Request for ${request.assistanceType}}
                  description={Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId}}
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
                  title={${request.name}'s Request for ${request.assistanceType}}
                  description={Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId}}
                />
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
                  title={${request.name}'s Request for ${request.assistanceType}}
                  description={Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy} | Mentor: ${request.mentorId}}
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