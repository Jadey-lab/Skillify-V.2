// Full file: EventsPage.jsx
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
  notification,
  Avatar,
  Grid,
  Tabs,
  List,
  Popconfirm,
  Select,
  Card,
  Space,
  Pagination,
  Spin,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getAuth,
  onAuthStateChanged
} from "firebase/auth";
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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { nanoid } from "nanoid";
import { db } from "../firebase";
import BackButton from "../components/BackButton";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

const chapters = [
  { id: "nwu", name: "NWU SAS" },
  { id: "lesotho", name: "International - Lesotho" },
  { id: "kenya", name: "International - Kenya" },
];

export default function EventsPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { chapterId } = useParams();
  const chapterName = chapters.find((ch) => ch.id === chapterId)?.name || "Chapter";

  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState(null);

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [eventForm] = Form.useForm();
  const [bookingForm] = Form.useForm();

  const auth = getAuth();
  const storage = getStorage();

  const [filterEvent, setFilterEvent] = useState("all");
  const [eventsPage, setEventsPage] = useState(1);
  const eventsPageSize = 6;
  const [bookingsPage, setBookingsPage] = useState(1);
  const bookingsPageSize = 6;

  useEffect(() => {
    const fetchUserData = async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const d = snap.data();
        setUserRole(d.role?.toLowerCase() || null);
        setUserInfo(d);
      }
    };
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setCurrentUser(u);
        fetchUserData(u.uid);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserInfo(null);
      }
    });
    return () => unsub();
  }, [auth]);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("eventDateTime", "desc"));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.chapterId === chapterId) list.push({ id: docSnap.id, ...d });
      });
      setEvents(list);
    } catch (e) {
      notification.error({ message: "Failed to load events" });
    }
  };

  const fetchBookings = async () => {
    try {
      const evSnap = await getDocs(query(collection(db, "events"), orderBy("eventDateTime", "desc")));
      const evs = [];
      evSnap.forEach((s) => {
        const d = s.data();
        if (d.chapterId === chapterId) evs.push({ eventId: s.id, title: d.title });
      });
      const all = [];
      for (const { eventId, title } of evs) {
        const key = `${chapterId}-${title.replace(/\s+/g, "_")}`;
        const bk = await getDocs(collection(db, `events/${key}/bookings`));
        bk.forEach((b) => all.push({ id: b.id, ...b.data(), eventTitle: title }));
      }
      setBookings(all);
    } catch (e) {
      notification.error({ message: "Failed to load bookings" });
    }
  };

  useEffect(() => {
    if (chapterId) {
      fetchEvents();
      fetchBookings();
    }
  }, [chapterId]);

  const combineDateTime = (d, t) => {
    if (!d || !t) return null;
    const date = d.toDate ? d.toDate() : d;
    const time = t.toDate ? t.toDate() : t;
    return new Date(
      date.getFullYear(), date.getMonth(), date.getDate(),
      time.getHours(), time.getMinutes()
    );
  };

  const userBelongs = userInfo?.chapter === chapterName;
  const canManage = ["chairperson", "admin", "manager"].includes(userRole);

  const openBookingModal = (title) => {
    setSelectedEventTitle(title);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (vals) => {
    if (!currentUser) return notification.warning({ message: "Not signed in" });
    const key = `${chapterId}-${selectedEventTitle.replace(/\s+/g, "_")}`;
    try {
      await setDoc(doc(db, `events/${key}/bookings`, nanoid()), {
        ...vals,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      notification.success({ message: "Booked!" });
      setShowBookingModal(false);
      bookingForm.resetFields();
      fetchBookings();
    } catch (e) {
      notification.error({ message: "Booking failed" });
    }
  };

  const openEditModal = (evt) => {
    const dt = evt.eventDateTime?.toDate ? evt.eventDateTime.toDate() : evt.eventDateTime;
    eventForm.setFieldsValue({
      title: evt.title,
      date: moment(dt),
      time: moment(dt),
      venue: evt.venue,
      thumbnail: null,
    });
    setSelectedEvent(evt);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (vals) => {
    setUploading(true);
    try {
      const dt = combineDateTime(vals.date, vals.time);
      let url = selectedEvent.thumbnailUrl || null;
      if (vals.thumbnail?.[0]?.originFileObj) {
        const f = vals.thumbnail[0].originFileObj;
        const refPath = ref(storage, `eventThumbnails/${Date.now()}_${f.name}`);
        await uploadBytes(refPath, f);
        url = await getDownloadURL(refPath);
      }
      await setDoc(doc(db, "events", selectedEvent.id), {
        title: vals.title,
        venue: vals.venue,
        eventDateTime: dt,
        thumbnailUrl: url,
        updatedAt: new Date(),
        chapterId,
      }, { merge: true });
      notification.success({ message: "Event updated" });
      setShowEditModal(false);
      fetchEvents();
    } catch (e) {
      notification.error({ message: "Update failed" });
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "events", id));
      notification.success({ message: "Deleted" });
      fetchEvents();
    } catch (e) {
      notification.error({ message: "Delete failed" });
    }
  };

  const handleEventUpload = async (values) => {
    setUploading(true);
    try {
      const eventDateTime = combineDateTime(values.date, values.time);
      const fileObj = values.thumbnail?.[0]?.originFileObj;
      if (!fileObj) return notification.warning({ message: "Thumbnail is required" });

      const refPath = ref(storage, `eventThumbnails/${Date.now()}_${fileObj.name}`);
      await uploadBytes(refPath, fileObj);
      const url = await getDownloadURL(refPath);

      await addDoc(collection(db, "events"), {
        title: values.title,
        venue: values.venue,
        eventDateTime,
        thumbnailUrl: url,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        chapterId,
      });
      notification.success({ message: "Event created!" });
      eventForm.resetFields();
      fetchEvents();
    } catch (err) {
      notification.error({ message: "Upload failed: " + err.message });
    }
    setUploading(false);
  };

  const renderEventCard = (evt, allowActions) => {
    const dt = moment(evt.eventDateTime?.toDate?.() || evt.eventDateTime).format("LLL");
    return (
      <List.Item key={evt.id} style={{ padding: 0 }}>
        <Card
          hoverable
          cover={<div style={{
            height: 180,
            background: `url(${evt.thumbnailUrl}) center/cover no-repeat`,
          }} />}
          actions={allowActions ? [
            <EditOutlined onClick={() => openEditModal(evt)} />,
            <Popconfirm title="Delete?" onConfirm={() => handleDelete(evt.id)}>
              <DeleteOutlined />
            </Popconfirm>,
            <PictureOutlined onClick={() => {
              setImageModalUrl(evt.thumbnailUrl);
              setShowImageModal(true);
            }} />,
          ] : [
            <Button onClick={() => openBookingModal(evt.title)}>Book</Button>,
            <PictureOutlined onClick={() => {
              setImageModalUrl(evt.thumbnailUrl);
              setShowImageModal(true);
            }} />,
          ]}
        >
          <Card.Meta title={evt.title} description={`${evt.venue} — ${dt}`} />
        </Card>
      </List.Item>
    );
  };

  const uploadTab = {
    key: "upload",
    label: "Upload Events",
    children: (
      <Form
        layout="vertical"
        form={eventForm}
        onFinish={handleEventUpload}
        style={{ maxWidth: 400, margin: "0 auto" }}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="time" label="Time" rules={[{ required: true }]}>
          <TimePicker style={{ width: "100%" }} format="HH:mm" />
        </Form.Item>
        <Form.Item name="venue" label="Venue" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="thumbnail"
          label="Thumbnail"
          valuePropName="fileList"
          getValueFromEvent={(e) => e && e.fileList}
          rules={[{ required: true }]}
        >
          <Upload.Dragger
            name="thumbnail"
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
            accept="image/*"
          >
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">Click or drag image to upload</p>
            <p className="ant-upload-hint">Only image files are supported</p>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} block>
            Upload Event
          </Button>
        </Form.Item>
      </Form>
    )
  };

  const publicTab = {
    key: "public",
    label: "Public View",
    children: (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        pagination={{
          current: eventsPage,
          pageSize: eventsPageSize,
          onChange: setEventsPage,
          showSizeChanger: false,
        }}
        dataSource={events.slice((eventsPage - 1) * eventsPageSize, eventsPage * eventsPageSize)}
        renderItem={(evt) => renderEventCard(evt, false)}
      />
    )
  };

  const manageTab = {
    key: "manage",
    label: "Manage Posts",
    children: (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={events}
        renderItem={(evt) => renderEventCard(evt, true)}
      />
    )
  };

  const tabs = [publicTab];
  if (userBelongs && canManage) tabs.push(manageTab, uploadTab);

  return (
    <Spin spinning={uploading} tip="Processing...">
      <div style={{ padding: 16, maxWidth: 960, margin: "auto" }}>
        <div style={{ textAlign: "right", marginBottom: 8 }}>
          {userInfo && (
            <Avatar src={userInfo.profileImage}>
              {!userInfo.profileImage && `${userInfo.firstName?.[0]}${userInfo.surname?.[0]}`}
            </Avatar>
          )}
        </div>
        <Title level={3} style={{ textAlign: "center" }}>{chapterName}</Title>
        <Tabs centered={!isMobile} items={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          children: tab.children,
        }))} />
        <Modal visible={showImageModal} footer={null} onCancel={() => setShowImageModal(false)} centered>
          <img alt="Thumbnail" src={imageModalUrl} style={{ width: "100%" }} />
        </Modal>
        <BackButton />
      </div>
    </Spin>
  );
}
