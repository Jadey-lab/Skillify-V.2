import React, { useEffect, useState } from "react"; 
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import {
  Card,
  List,
  Typography,
  Spin,
  Badge,
  Tabs,
  Button,
  Space,
  Tooltip,
} from "antd";
import {
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { auth, db } from "./firebaseConfig";

const { Paragraph, Text, Link } = Typography;
const { TabPane } = Tabs;

const MyMentorshipMessages = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [readMessages, setReadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unread");
  const [chatVisible, setChatVisible] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const q = query(
          collection(db, "mentorMessages"),
          where("recipientEmail", "==", currentUser.email)
        );

        const unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
          const allMessages = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
              const aTime = a.sessionDate?.toDate?.() ?? new Date(a.sessionDate);
              const bTime = b.sessionDate?.toDate?.() ?? new Date(b.sessionDate);
              return bTime - aTime;
            });

          const mentorIds = Array.from(
            new Set(allMessages.map((msg) => msg.mentorId))
          );

          const mentorMap = {};
          await Promise.all(
            mentorIds.map(async (id) => {
              const docRef = doc(db, "users", id);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                mentorMap[id] = docSnap.data();
              } else {
                mentorMap[id] = { name: id };
              }
            })
          );

          const unread = [];
          const read = [];

          allMessages.forEach((msg) => {
            msg.mentor = mentorMap[msg.mentorId] || { name: msg.mentorId };
            if (msg.readBy?.includes(currentUser.uid)) {
              read.push(msg);
            } else {
              unread.push(msg);
            }
          });

          setMessages(unread);
          setReadMessages(read);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setMessages([]);
        setReadMessages([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleExpand = (msg) => {
    setExpandedMessageId((prevId) => (prevId === msg.id ? null : msg.id));
  };

  const handleMarkAsRead = async (msg) => {
    await updateDoc(doc(db, "mentorMessages", msg.id), {
      readBy: arrayUnion(user.uid),
    });

    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    setReadMessages((prev) => [...prev, { ...msg, readBy: [...(msg.readBy || []), user.uid] }]);
    setExpandedMessageId(null);
  };

  const currentMessages = activeTab === "unread" ? messages : readMessages;

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<MessageIcon />}
          size="large"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            backgroundColor: "#25D366",
            border: "none",
          }}
          onClick={() => setChatVisible(!chatVisible)}
        />
      </div>

      {chatVisible && (
        <Card
          title="Mentor Notification"
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 370,
            maxHeight: "70vh",
            overflowY: "auto",
            zIndex: 999,
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
            <TabPane
              key="unread"
              tab={
                <Badge count={messages.length} size="small">
                  Unread
                </Badge>
              }
            />
            <TabPane key="recent" tab="Recent Chats" />
          </Tabs>

          {loading ? (
            <Spin style={{ display: "block", margin: "30px auto" }} />
          ) : (
            <List
              dataSource={currentMessages}
              renderItem={(msg) => {
                const isUnread = !msg.readBy?.includes(user?.uid);
                const isExpanded = expandedMessageId === msg.id;

                return (
                  <List.Item
                    key={msg.id}
                    onClick={() => handleExpand(msg)}
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      backgroundColor: isUnread ? "#f6ffed" : "#fafafa",
                      borderLeft: isUnread ? "4px solid #52c41a" : "none",
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      cursor: "pointer",
                      border: "1px solid #f0f0f0",
                      position: "relative",
                    }}
                  >
                    <Paragraph strong style={{ marginBottom: 4 }}>
                      <PersonIcon fontSize="small" style={{ marginRight: 4 }} />
                      {msg.mentor?.name || msg.mentorId}
                    </Paragraph>
                    <Paragraph>{msg.message}</Paragraph>
                    <Text type="secondary">
                      <CalendarMonthIcon fontSize="small" style={{ marginRight: 4 }} />
                      {msg.sessionDate?.toDate?.()?.toLocaleString() ??
                        new Date(msg.sessionDate).toLocaleString()}
                    </Text>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="expand"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: "hidden", marginTop: 8, width: "100%" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Space direction="vertical" size="small">
                            {msg.fetchLink && (
                              <Link href={msg.fetchLink} target="_blank">
                                <InsertDriveFileIcon fontSize="small" style={{ marginRight: 4 }} />
                                Fetch Link
                              </Link>
                            )}
                            {msg.meetLink && (
                              <Link href={msg.meetLink} target="_blank">
                                <InsertDriveFileIcon fontSize="small" style={{ marginRight: 4 }} />
                                Meet Link
                              </Link>
                            )}
                            {msg.resourceLink && (
                              <Link href={msg.resourceLink} target="_blank">
                                <InsertDriveFileIcon fontSize="small" style={{ marginRight: 4 }} />
                                Resource
                              </Link>
                            )}
                            {isUnread && (
                              <Button
                                size="small"
                                type="primary"
                                onClick={() => handleMarkAsRead(msg)}
                                style={{ marginTop: 8 }}
                              >
                                Mark as Read
                              </Button>
                            )}
                          </Space>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      )}
    </>
  );
};

export default MyMentorshipMessages;
