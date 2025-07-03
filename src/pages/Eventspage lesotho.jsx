
import React, { useEffect, useState } from "react";
import {
  Typography,
  Input,
  DatePicker,
  TimePicker,
  Button,
  Upload,
  Modal,
  Form,
  message,
  Avatar,
  Grid,
  Tabs,
  List,
  Popconfirm,
  Image,
  Checkbox,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { nanoid } from "nanoid";
import { db } from "../firebase";
import BackButton from "../components/BackButton";
import { useParams } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Row, Col, Pagination } from 'antd';
const { Title } = Typography;
const { useBreakpoint } = Grid;

const EventsPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [eventForm] = Form.useForm();
  const [bookingForm] = Form.useForm();
  const { chapterId } = useParams();

  const auth = getAuth();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserRole(data.role?.toLowerCase() || null);
          setUserInfo(data);
        } else {
          setUserRole(null);
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserData(user.uid);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("eventDateTime", "desc"));
      const querySnapshot = await getDocs(q);
      const evts = [];
      querySnapshot.forEach((doc) => {
        evts.push({ id: doc.id, ...doc.data() });
      });
      setEvents(evts);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      message.error("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const combineDateTime = (dateMoment, timeMoment) => {
    if (!dateMoment || !timeMoment) return null;
    const date = dateMoment.toDate ? dateMoment.toDate() : dateMoment;
    const time = timeMoment.toDate ? timeMoment.toDate() : timeMoment;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    );
  };

  const getInitials = (firstName, surname) => {
    const first = firstName?.trim()[0] || "";
    const last = surname?.trim()[0] || "";
    return (first + last).toUpperCase();
  };
  const EventCardGrid = ({ data, showActions, onEdit, onDelete, openBooking }) => {
  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const openFullImage = (url) => {
    setSelectedImage(url);
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
    setSelectedImage(null);
  };

  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <Row gutter={[24, 24]}>
        {paginatedData.map((event) => {
          const eventDate = event.eventDateTime?.toDate
            ? event.eventDateTime.toDate()
            : event.eventDateTime;

          return (
            <Col key={event.id} xs={24} sm={12} md={8}>
              <div
                style={{
                  position: "relative",
                  height: 320,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: "#000",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                {event.thumbnailUrl ? (
                  <img
                    src={event.thumbnailUrl}
                    alt={event.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "brightness(0.6)",
                    }}
                  />
                ) : (
                  <div style={{ height: "100%", backgroundColor: "#333" }} />
                )}

                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    backgroundColor: "#ff4d4f",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  {eventDate ? moment(eventDate).format("D MMM") : ""}
                </div>

                <VisibilityIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullImage(event.thumbnailUrl);
                  }}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    color: "#fff",
                    fontSize: 24,
                    cursor: "pointer",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    padding: 16,
                    background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))",
                  }}
                >
                  <Title level={4} style={{ margin: 0, color: "#fff" }}>
                    {event.title}
                  </Title>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    <div>
                      <strong>Date:</strong>{" "}
                      {eventDate ? moment(eventDate).format("dddd, MMM D, YYYY") : "Not specified"}
                    </div>
                    <div>
                      <strong>Time:</strong>{" "}
                      {eventDate ? moment(eventDate).format("HH:mm") : "Not specified"}
                    </div>
                    <div>
                      <strong>Venue:</strong> {event.venue || "Not specified"}
                    </div>
                  </div>

                  <Button
                    type="primary"
                    style={{ marginTop: 12 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openBooking(event.title);
                    }}
                  >
                    Book a Spot
                  </Button>

                  {showActions && (
                    <div style={{ marginTop: 8 }}>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => onEdit(event)}
                        type="link"
                        style={{ color: "#fff" }}
                      />
                      <Popconfirm
                        title="Delete this event?"
                        onConfirm={() => onDelete(event.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button icon={<DeleteOutlined />} type="link" danger style={{ color: "#fff" }} />
                      </Popconfirm>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={data.length}
        onChange={(page) => setCurrentPage(page)}
        style={{ textAlign: "center", marginTop: 24 }}
      />

      <Modal open={visible} onCancel={handleClose} footer={null} centered width="80%">
        <img
          src={selectedImage}
          alt="Full View"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 0,
            objectFit: "contain",
          }}
        />
      </Modal>
    </>
  );
};

  const handleEventUpload = async (values) => {
    setUploading(true);
    try {
      const eventDateTime = combineDateTime(values.date, values.time);
      if (!eventDateTime) {
        message.error("Please provide valid date and time");
        setUploading(false);
        return;
      }

      let thumbnailUrl = null;
      if (values.thumbnail && values.thumbnail.fileList.length > 0) {
        const file = values.thumbnail.fileList[0].originFileObj;
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `eventThumbnails/${fileName}`);
        await uploadBytes(storageRef, file);
        thumbnailUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "events"), {
        title: values.title,
        venue: values.venue,
        eventDateTime,
        thumbnailUrl,
        createdBy: currentUser.uid,
        createdAt: new Date(),
      });

      message.success("Event uploaded!");
      eventForm.resetFields();
      fetchEvents();
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Upload failed: " + error.message);
    }
    setUploading(false);
  };

  const openBookingModal = (title) => {
    setSelectedEventTitle(title);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (values) => {
    if (!currentUser || !selectedEventTitle || !chapterId) {
      message.warning("Missing event or chapter");
      return;
    }

    const eventKey = selectedEventTitle.replace(/\s+/g, "_");
    const fullEventKey = `${chapterId}-${eventKey}`;
    const bookingId = nanoid();
    const bookingRef = doc(db, `events/${fullEventKey}/bookings`, bookingId);

    try {
      await setDoc(bookingRef, {
        ...values,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      message.success("Booking submitted!");
      setShowBookingModal(false);
      bookingForm.resetFields();
    } catch (error) {
      console.error("Booking failed:", error);
      message.error("Booking failed");
    }
  };

  const openEditModal = (event) => {
    let eventDateTime = event.eventDateTime?.toDate
      ? event.eventDateTime.toDate()
      : event.eventDateTime;

    eventForm.setFieldsValue({
      title: event.title,
      date: moment(eventDateTime),
      time: moment(eventDateTime),
      venue: event.venue,
      thumbnail: null,
    });

    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (values) => {
    setUploading(true);
    try {
      const eventDateTime = combineDateTime(values.date, values.time);
      let thumbnailUrl = selectedEvent?.thumbnailUrl || null;

      if (values.thumbnail && values.thumbnail.fileList.length > 0) {
        const file = values.thumbnail.fileList[0].originFileObj;
        const storageRef = ref(storage, `eventThumbnails/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        thumbnailUrl = await getDownloadURL(storageRef);
      }

      const eventDocRef = doc(db, "events", selectedEvent.id);
      await setDoc(
        eventDocRef,
        {
          title: values.title,
          venue: values.venue,
          eventDateTime,
          thumbnailUrl,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      message.success("Event updated!");
      setShowEditModal(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
      message.error("Update failed");
    }
    setUploading(false);
  };

  const handleDelete = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      message.success("Event deleted");
      fetchEvents();
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Delete failed");
    }
  };

  const showUploadTab = ["chairperson", "admin", "manager"].includes(userRole);

  const renderEventCard = (event, allowActions = false) => {
    const eventDate = event.eventDateTime?.toDate
      ? event.eventDateTime.toDate()
      : event.eventDateTime;

    return (
      <List.Item
        key={event.id}
        actions={
          allowActions
            ? [
                <Button
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(event)}
                  type="link"
                  style={{ color: "#fff" }}
                />,
                <Popconfirm
                  title="Delete this event?"
                  onConfirm={() => handleDelete(event.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} type="link" danger style={{ color: "#fff" }} />
                </Popconfirm>,
              ]
            : []
        }
        style={{
          background: "#000",
          color: "#fff",
          position: "relative",
          width: isMobile ? "100%" : 320,
          height: 320,
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 20,
          display: "inline-block",
          verticalAlign: "top",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)",
        }}
        onClick={() => openBookingModal(event.title)}
      >
        {event.thumbnailUrl ? (
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.6)",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <div style={{ backgroundColor: "#333", height: "100%", width: "100%" }} />
        )}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: "#ff4d4f",
            padding: "6px 12px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {eventDate ? moment(eventDate).format("D MMM") : ""}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: 16,
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#fff" }}>
            {event.title}
          </Title>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            <div>
              <strong>Date:</strong>{" "}
              {eventDate ? moment(eventDate).format("dddd, MMM D, YYYY") : "Not specified"}
            </div>
            <div>
              <strong>Time:</strong> {eventDate ? moment(eventDate).format("HH:mm") : ""}
            </div>
            <div>
              <strong>Venue:</strong> {event.venue || "Not specified"}
            </div>
          </div>
          <Button
            type="primary"
            style={{ marginTop: 12 }}
            onClick={(e) => {
              e.stopPropagation();
              openBookingModal(event.title);
            }}
          >
            Book a Spot
          </Button>
        </div>
      </List.Item>
    );
  };

 const tabs = [
  {
    key: "public",
    label: "Public View",
    children: (
      <EventCardGrid
        data={events}
        showActions={false}
        openBooking={openBookingModal}
      />
    ),
  },
];




  if (showUploadTab) {
    tabs.push(
      {
        key: "manage",
        label: "Manage Posts",
        children: (
          <List
            dataSource={events}
            locale={{ emptyText: "No events to manage" }}
            renderItem={(event) => renderEventCard(event, true)}
          />
        ),
      },
      {
        key: "upload",
        label: "Upload Events",
        children: (
          <Form layout="vertical" form={eventForm} onFinish={handleEventUpload}>
            <Form.Item name="title" label="Event Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="time" label="Time" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="venue" label="Venue" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="thumbnail" label="Upload Thumbnail">
              <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>
              Submit Event
            </Button>
          </Form>
        ),
      }
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {userInfo && (
          <Avatar
            style={{ backgroundColor: "#0050b3" }}
            src={userInfo.profileImage}
          >
            {!userInfo.profileImage && getInitials(userInfo.firstName, userInfo.surname)}
          </Avatar>
        )}
      </div>

      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Lesotho Chapter
      </Title>

      <Tabs centered={!isMobile} items={tabs} />

      <Modal
        title={`Book a Spot - ${selectedEventTitle}`}
        open={showBookingModal}
        onCancel={() => setShowBookingModal(false)}
        footer={null}
      >
        <Form layout="vertical" form={bookingForm} onFinish={handleBookingSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="surname" label="Surname" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fieldOfStudy" label="Field of Study" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="occupation" label="Occupation" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="institution" label="Institution" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="motivation" label="Motivation" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nextOfKin" label="Next of Kin Details" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="consent"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("You must consent to the use of your image and information.")
                      ),
              },
            ]}
          >
            <Checkbox>
              Consent to use of images and non-personal confidential information (POPIA)
            </Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit Booking
          </Button>
        </Form>
      </Modal>

      <Modal
        title={`Edit Event - ${selectedEvent?.title || ""}`}
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
      >
        <Form layout="vertical" form={eventForm} onFinish={handleEditSubmit}>
          <Form.Item name="title" label="Event Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="venue" label="Venue" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="thumbnail" label="Upload New Thumbnail (optional)">
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} block>
            Update Event
          </Button>
        </Form>
      </Modal>

      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
        <BackButton />
      </div>
    </div>
  );
};

export default EventsPage;
