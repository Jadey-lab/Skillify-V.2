import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  List,
  Spin,
  Typography,
  notification,
  Modal,
  Button,
  Select,
  Row,
  Col,
  message,
} from "antd";
import moment from "moment";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MyCalendar from "./MyCalendar";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const { Text } = Typography;
const { Option } = Select;

const SessionSchedulingTab = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentorID, setMentorID] = useState(null);
  const [menteesList, setMenteesList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [calendarView, setCalendarView] = useState("month");
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);

  // Calculate session duration in hours (rounded to 2 decimals)
  const sessionDuration =
    selectedStartTime && selectedEndTime
      ? (
          moment(selectedEndTime).diff(moment(selectedStartTime), "minutes") / 60
        ).toFixed(2)
      : null;

  // ============================
  // 1. Load and Initialize gapi
  // ============================
  useEffect(() => {
    const loadGapiScript = () => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = initGapiClient;
      document.body.appendChild(script);
    };

    const initGapiClient = () => {
      window.gapi.load("client:auth2", () => {
        window.gapi.client
          .init({
            apiKey: "AIzaSyANGvZz0r7W_veVjMZOM9E2rEB_5899yVo", 
            clientId: "323474486768-6fhiebdfii3129qnaaeag11nrqcsr1l9.apps.googleusercontent.com", 
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
            scope: "https://www.googleapis.com/auth/calendar.events",
          })
          .then(() => {
            if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
              window.gapi.auth2.getAuthInstance().signIn();
            }
          })
          .catch((error) => {
            console.error("Error initializing gapi client", error);
          });
      });
    };

    if (!window.gapi) {
      loadGapiScript();
    } else {
      initGapiClient();
    }
  }, []);

  // ============================================
  // 2. Fetch Mentor ID and User Data from Firebase
  // ============================================
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        (async () => {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setMentorID(userData.mentorID);
            } else {
              console.log("User document not found.");
            }
          } catch (error) {
            console.error("Error fetching mentor ID: ", error);
          }
        })();
      } else {
        console.log("No user logged in.");
      }
    });
    return () => unsubscribe();
  }, []);

  // ====================================
  // 3. Handlers for ReactDatePicker
  // ====================================
  const handleDatePickerChange = (date) => {
    setSelectedDate(date);
  };
  const handleStartTimeChange = (date) => {
    setSelectedStartTime(date);
  };
  const handleEndTimeChange = (date) => {
    setSelectedEndTime(date);
  };

  // =======================================================
  // 4. Fetch acceptedRequests and Scheduled Sessions Data
  // =======================================================
  useEffect(() => {
    if (!mentorID) return;
    const fetchAcceptedRequests = async () => {
      setLoading(true);
      try {
        const requestsQuery = query(
          collection(db, "acceptedRequests"),
          where("mentorId", "==", mentorID)
        );
        const requestSnapshot = await getDocs(requestsQuery);
        const requestsData = requestSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMenteesList(requestsData);
        const feedbackPromises = requestsData.map(async (request) => {
          const feedbackQuery = query(
            collection(db, "requestFeedbacks"),
            where("requestId", "==", request.id)
          );
          const feedbackSnapshot = await getDocs(feedbackQuery);
          const feedbackData = feedbackSnapshot.docs.map((doc) => doc.data());
          return { request, feedbackData };
        });
        const feedbackResults = await Promise.all(feedbackPromises);
        setFeedbacks(feedbackResults);
      } catch (error) {
        console.error("Error fetching acceptedRequests: ", error);
        notification.error({
          message: "Error",
          description: "There was an error fetching accepted requests.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAcceptedRequests();
  }, [mentorID]);

  useEffect(() => {
    if (!mentorID) return;
    const fetchScheduledSessions = async () => {
      try {
        const sessionsQuery = query(
          collection(db, "scheduled"),
          where("mentorID", "==", mentorID)
        );
        const sessionSnapshot = await getDocs(sessionsQuery);
        const sessionsData = sessionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        }));
        setScheduledSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching scheduled sessions:", error);
        notification.error({
          message: "Error",
          description: "Failed to load scheduled sessions.",
        });
      }
    };
    fetchScheduledSessions();
  }, [mentorID]);

  // ===============================================
  // 5. Map scheduledSessions to Calendar Events
  // ===============================================
  const calendarEvents = useMemo(() => {
    return scheduledSessions.map((session) => ({
      id: session.id,
      title: `${session.menteeName} | ${session.assistanceType || "N/A"} | ${
        session.fieldOfStudy || "N/A"
      } | ${session.yearOfStudy || "N/A"} | ${session.email || "N/A"}`,
      start: session.date,
      end: session.endDate
        ? session.endDate.toDate()
        : moment(session.date).add(1, "hour").toDate(),
      resource: session,
    }));
  }, [scheduledSessions]);

  // ====================================
  // 6. Calendar Interaction Handlers
  // ====================================
  const handleSelectSlot = (slotInfo) => {
    setIsRescheduleMode(false);
    setSelectedDate(slotInfo.start);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setSelectedMentee(null);
    setCurrentBookingId(null);
    setIsModalVisible(true);
  };

  const handleDayClick = (date) => {
    if (calendarView === "month") {
      setCalendarView("day");
    }
    setSelectedDate(date);
  };

  const handleReschedule = (booking) => {
    setIsRescheduleMode(true);
    const bookingDate = booking.request
      ? booking.request.date.toDate()
      : booking.date;
    setSelectedDate(bookingDate);
    setSelectedStartTime(bookingDate);
    setSelectedEndTime(moment(bookingDate).add(1, "hour").toDate());
    setSelectedMentee(
      booking.request ? booking.request.name : booking.menteeName
    );
    setCurrentBookingId(
      booking.request ? booking.request.scheduledSessionId : booking.id
    );
    setEventModalVisible(false);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setSelectedMentee(null);
    setIsRescheduleMode(false);
    setCurrentBookingId(null);
  };

  const handleMenteeSelect = (value) => {
    setSelectedMentee(value);
  };

  // ====================================================
  // 7. Helper: Create a Google Meet Event via gapi
  // ====================================================
  const createGoogleMeetEvent = async (startDateTime, endDateTime, summary) => {
    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        resource: {
          summary,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
          conferenceData: {
            createRequest: {
              requestId: Math.random().toString(36).substring(2),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      });
      return response.result.hangoutLink;
    } catch (error) {
      console.error("Error creating Google Meet event", error);
      throw error;
    }
  };

  // ====================================================
  // 8. Handle Confirm Session (Create/Reschedule Session)
  // ====================================================
  const handleConfirmSession = async () => {
    if (
      !selectedDate ||
      (!isRescheduleMode && !selectedMentee) ||
      !selectedStartTime ||
      !selectedEndTime
    ) {
      notification.error({
        message: "Incomplete Data",
        description:
          "Please select a date, start time, end time, and (if scheduling) a mentee.",
      });
      return;
    }

    if (moment(selectedEndTime).isSameOrBefore(moment(selectedStartTime))) {
      notification.error({
        message: "Invalid Time Range",
        description: "End time must be later than start time.",
      });
      return;
    }

    const startDateTime = moment(selectedDate)
      .hour(moment(selectedStartTime).hour())
      .minute(moment(selectedStartTime).minute())
      .second(0)
      .toISOString();

    const endDateTime = moment(selectedDate)
      .hour(moment(selectedEndTime).hour())
      .minute(moment(selectedEndTime).minute())
      .second(0)
      .toISOString();

    try {
      const conflictingSessionQuery = query(
        collection(db, "scheduled"),
        where("mentorID", "==", mentorID),
        where("date", "==", new Date(startDateTime))
      );
      const conflictingSnapshot = await getDocs(conflictingSessionQuery);
      if (!conflictingSnapshot.empty) {
        notification.warning({
          message: "Time Slot Unavailable",
          description:
            "You already have a session scheduled at this start time.",
        });
        return;
      }

      let meetLink = null;

      if (isRescheduleMode && currentBookingId) {
        const bookingDocRef = doc(db, "scheduled", currentBookingId);
        await updateDoc(bookingDocRef, {
          date: new Date(startDateTime),
          endDate: new Date(endDateTime),
        });
        notification.success({
          message: "Session Rescheduled",
          description: `Session rescheduled to ${new Date(startDateTime).toDateString()} from ${moment(startDateTime).format("HH:mm")} to ${moment(endDateTime).format("HH:mm")}.`,
        });
        message.success("Session rescheduled successfully!");
      } else {
        const acceptedRequestQuery = query(
          collection(db, "acceptedRequests"),
          where("name", "==", selectedMentee)
        );
        const snapshot = await getDocs(acceptedRequestQuery);
        if (snapshot.empty) {
          notification.error({
            message: "Mentee Not Found",
            description:
              "Could not find additional details for the selected mentee.",
          });
          return;
        }
        const acceptedRequestDoc = snapshot.docs[0];
        const acceptedRequest = acceptedRequestDoc.data();
        const newSession = {
          mentorID,
          menteeName: acceptedRequest.name,
          assistanceType: acceptedRequest.assistanceType || "",
          fieldOfStudy: acceptedRequest.fieldOfStudy || "",
          yearOfStudy: acceptedRequest.yearOfStudy || "",
          email: acceptedRequest.email || "",
          acceptedRequestId: acceptedRequestDoc.id,
          date: new Date(startDateTime),
          endDate: new Date(endDateTime),
          createdAt: new Date(),
        };
        const docRef = await addDoc(collection(db, "scheduled"), newSession);

        // Create Google Meet event
        meetLink = await createGoogleMeetEvent(
          startDateTime,
          endDateTime,
          "Mentorship Session"
        );

        // Update Firestore with the meet link
        await updateDoc(doc(db, "scheduled", docRef.id), {
          meetLink,
        });
        notification.success({
          message: "Session Scheduled",
          description: `Session scheduled on ${new Date(startDateTime).toDateString()} from ${moment(startDateTime).format("HH:mm")} to ${moment(endDateTime).format("HH:mm")}.`,
        });
        message.success("Session scheduled successfully!");
      }
    } catch (error) {
      console.error("Error managing session: ", error);
      notification.error({
        message: "Error",
        description: "There was an error processing your request.",
      });
    }
    handleModalClose();
  };

  // ================================================
  // 9. Event Details and Delete Session Handlers
  // ================================================
  const handleSelectEvent = async (event) => {
    try {
      const menteeName = event.resource.menteeName;
      const acceptedRequestQuery = query(
        collection(db, "acceptedRequests"),
        where("name", "==", menteeName)
      );
      const snapshot = await getDocs(acceptedRequestQuery);
      if (!snapshot.empty) {
        const acceptedRequestDoc = snapshot.docs[0];
        const acceptedRequest = acceptedRequestDoc.data();
        event.resource.assistanceType = acceptedRequest.assistanceType;
        event.resource.fieldOfStudy = acceptedRequest.fieldOfStudy;
        event.resource.yearOfStudy = acceptedRequest.yearOfStudy;
        event.resource.email = acceptedRequest.email;
        event.resource.acceptedRequestId = acceptedRequestDoc.id;
      }
    } catch (error) {
      console.error("Error fetching acceptedRequest details", error);
    }
    setSelectedEventDetail(event);
    setEventModalVisible(true);
  };

  const handleDeleteScheduledSession = async () => {
    if (selectedEventDetail && selectedEventDetail.id) {
      try {
        await deleteDoc(doc(db, "scheduled", selectedEventDetail.id));
        notification.success({
          message: "Session Deleted",
          description: "The scheduled session has been deleted.",
        });
        setScheduledSessions(
          scheduledSessions.filter((s) => s.id !== selectedEventDetail.id)
        );
        setEventModalVisible(false);
      } catch (error) {
        console.error("Error deleting scheduled session: ", error);
        notification.error({
          message: "Error",
          description: "There was an error deleting the scheduled session.",
        });
      }
    }
  };

  // ====================================
  // 10. Handle Add Event Button Click
  // ====================================
  const handleAddEvent = () => {
    setIsRescheduleMode(false);
    setSelectedDate(new Date());
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setSelectedMentee(null);
    setCurrentBookingId(null);
    setIsModalVisible(true);
  };

  // ====================================
  // 11. Render Mentee Details in Modal
  // ====================================
  const renderMenteeDetails = () => {
    if (!selectedMentee) return null;
    const menteeDetails = menteesList.find((m) => m.name === selectedMentee);
    if (!menteeDetails) return null;
    return (
      <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #ccc" }}>
        <p>
          <strong>Assistance Type:</strong> {menteeDetails.assistanceType || "N/A"}
        </p>
        <p>
          <strong>Field of Study:</strong> {menteeDetails.fieldOfStudy || "N/A"}
        </p>
        <p>
          <strong>Year of Study:</strong> {menteeDetails.yearOfStudy || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {menteeDetails.email || "N/A"}
        </p>
      </div>
    );
  };

  // ====================================
  // 12. Render the Component UI
  // ====================================
  return (
    <Card title="Session Scheduling & Management" bordered={false}>
      <p>Manage your mentorship sessions.</p>

      {/* Calendar Component */}
      <MyCalendar
        events={calendarEvents}
        onSelectEvent={handleSelectEvent}
        onAddEvent={handleAddEvent}
        onSelectSlot={handleSelectSlot}
        onDayClick={handleDayClick}
        calendarView={calendarView}
      />

      {/* Back to Month View Button */}
      {calendarView === "day" && (
        <Button style={{ margin: "10px 0" }} onClick={() => setCalendarView("month")}>
          Back to Month View
        </Button>
      )}

      {/* Scheduling / Rescheduling Modal */}
      <Modal
        title={isRescheduleMode ? "Reschedule Mentor Session" : "Schedule Mentor Session"}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmSession}
            disabled={
              !selectedDate ||
              (!isRescheduleMode && !selectedMentee) ||
              !selectedStartTime ||
              !selectedEndTime
            }
          >
            Confirm
          </Button>,
        ]}
      >
        <p>
          <strong>{isRescheduleMode ? "Current Date:" : "Selected Date:"}</strong>{" "}
          {selectedDate ? selectedDate.toDateString() : "None"}
        </p>
        <Row gutter={[10, 10]}>
          <Col xs={24} sm={12}>
            <p>
              <strong>{isRescheduleMode ? "Current Start Time:" : "Start Time:"}</strong>{" "}
              {selectedStartTime ? moment(selectedStartTime).format("HH:mm") : "None"}
            </p>
            <ReactDatePicker
              selected={selectedStartTime}
              onChange={handleStartTimeChange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Start Time"
              dateFormat="HH:mm"
              placeholderText="Select start time"
              className="ant-input"
            />
          </Col>
          <Col xs={24} sm={12}>
            <p>
              <strong>{isRescheduleMode ? "Current End Time:" : "End Time:"}</strong>{" "}
              {selectedEndTime ? moment(selectedEndTime).format("HH:mm") : "None"}
            </p>
            <ReactDatePicker
              selected={selectedEndTime}
              onChange={handleEndTimeChange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="End Time"
              dateFormat="HH:mm"
              placeholderText="Select end time"
              className="ant-input"
            />
          </Col>
        </Row>
        {selectedStartTime && selectedEndTime && (
          <p style={{ marginTop: "20px" }}>
            <strong>Session Duration:</strong> {sessionDuration}{" "}
            {sessionDuration === "1.00" ? "hour" : "hours"}
          </p>
        )}
        {!isRescheduleMode && (
          <>
            <p style={{ marginTop: "20px" }}>Please select a mentee for the session:</p>
            <Select
              placeholder="Select a mentee"
              onChange={handleMenteeSelect}
              style={{ width: "100%" }}
              value={selectedMentee}
            >
              {menteesList.map((mentee) => (
                <Option key={mentee.id} value={mentee.name}>
                  {mentee.name}
                </Option>
              ))}
            </Select>
            {renderMenteeDetails()}
          </>
        )}
        {isRescheduleMode && (
          <p style={{ marginTop: "20px" }}>
            <strong>Mentee:</strong> {selectedMentee || "Not assigned"}
          </p>
        )}
        <p style={{ marginTop: "20px" }}>
          <strong>Selected Date:</strong>{" "}
          {selectedDate ? selectedDate.toDateString() : "None"}
        </p>
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleDatePickerChange}
          dateFormat="MMMM d, yyyy"
          placeholderText="Select date"
          className="ant-input"
        />
      </Modal>

      {/* Event Details Modal */}
      <Modal
        title="Event Details"
        visible={eventModalVisible}
        onCancel={() => setEventModalVisible(false)}
        footer={[
          <Button key="reschedule" type="primary" onClick={() => handleReschedule(selectedEventDetail)}>
            Reschedule
          </Button>,
          <Button key="cancel" danger onClick={handleDeleteScheduledSession}>
            Delete Schedule
          </Button>,
        ]}
      >
        {selectedEventDetail && (
          <>
            <p>
              <strong>Event:</strong> {selectedEventDetail.title}
            </p>
            <p>
              <strong>Start:</strong> {moment(selectedEventDetail.start).format("LLL")}
            </p>
            <p>
              <strong>End:</strong> {moment(selectedEventDetail.end).format("LLL")}
            </p>
            <p>
              <strong>Assistance Type:</strong> {selectedEventDetail.resource.assistanceType || "N/A"}
            </p>
            <p>
              <strong>Field of Study:</strong> {selectedEventDetail.resource.fieldOfStudy || "N/A"}
            </p>
            <p>
              <strong>Year of Study:</strong> {selectedEventDetail.resource.yearOfStudy || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {selectedEventDetail.resource.email || "N/A"}
            </p>
            {selectedEventDetail.resource.meetLink && (
              <p>
                <strong>Google Meet Link:</strong>{" "}
                <a href={selectedEventDetail.resource.meetLink} target="_blank" rel="noopener noreferrer">
                  Join Meeting
                </a>
              </p>
            )}
          </>
        )}
      </Modal>

      {/* Feedbacks List */}
      {loading ? (
        <Spin tip="Loading feedback..." />
      ) : feedbacks.length === 0 ? (
        <Text type="danger">No feedback available for accepted requests.</Text>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={feedbacks}
          renderItem={(feedbackItem) => (
            <List.Item key={feedbackItem.request.id}>
              <List.Item.Meta
                title={`${feedbackItem.request.name}'s Request for ${feedbackItem.request.assistanceType}`}
                description={`Field of Study: ${feedbackItem.request.fieldOfStudy} | Year of Study: ${feedbackItem.request.yearOfStudy}`}
              />
              <div>
                <strong>Feedback:</strong>
                {feedbackItem.feedbackData.length > 0 ? (
                  feedbackItem.feedbackData.map((feedback, index) => (
                    <div key={index} style={{ marginTop: "10px" }}>
                      <strong>{feedback.name || "Anonymous"}:</strong>
                      <p>{feedback.message}</p>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">No feedback yet.</Text>
                )}
                <div style={{ marginTop: "10px" }}>
                  <Button type="link" onClick={() => handleReschedule(feedbackItem)}>
                    Reschedule
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default SessionSchedulingTab;
