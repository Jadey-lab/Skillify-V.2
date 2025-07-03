import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Badge,
  Select,
  Avatar,
  Alert,
} from "antd";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "./firebaseconfig2";
import dayjs from "dayjs";

const { Option, OptGroup } = Select;
const db = getFirestore(app);
const auth = getAuth(app);

const getUserId = (user) => user?.uid;

const MessagingTab = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsOnline(!!currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Load users from Firestore
  useEffect(() => {
    const uniqueUsers = new Map();

    const usersQuery = collection(db, "users");
    const mentorsQuery = collection(db, "mentorBookings");

    const handleSnapshot = (snapshot) => {
      snapshot.forEach((doc) => {
        const { email, name, role = "student", photoURL } = doc.data();
        if (email) {
          uniqueUsers.set(doc.id, {
            uid: doc.id,
            email,
            name: name || email,
            role,
            photoURL,
          });
        }
      });
      setUsers(Array.from(uniqueUsers.values()));
    };

    const unsub1 = onSnapshot(usersQuery, handleSnapshot);
    const unsub2 = onSnapshot(mentorsQuery, handleSnapshot);

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // Fetch messages for chat
  useEffect(() => {
    if (user && recipient) {
      const chatId = [getUserId(user), recipient].sort().join("_");
      const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const retrieved = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(retrieved);
      });

      return unsubscribe;
    } else {
      setMessages([]);
    }
  }, [user, recipient]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !recipient) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: message,
        sender: getUserId(user),
        recipient,
        chatId: [getUserId(user), recipient].sort().join("_"),
        timestamp: serverTimestamp(),
      });
      setMessage("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const renderMessageItem = (msg) => {
    const isSelf = msg.sender === getUserId(user);
    const time = msg.timestamp
      ? dayjs(msg.timestamp.toDate()).format("HH:mm, DD MMM")
      : "Sending...";
    return (
      <List.Item
        key={msg.id}
        style={{
          justifyContent: isSelf ? "flex-end" : "flex-start",
          padding: 8,
        }}
      >
        <div
          style={{
            background: isSelf ? "#bae7ff" : "#f5f5f5",
            padding: 10,
            borderRadius: 8,
            maxWidth: "75%",
          }}
        >
          <div style={{ fontWeight: "bold" }}>{isSelf ? "You" : msg.sender}</div>
          <div>{msg.text}</div>
          <div style={{ fontSize: 12, color: "gray", textAlign: "right" }}>{time}</div>
        </div>
      </List.Item>
    );
  };

  // Group users
  const groupedUsers = {
    mentor: [],
    student: [],
  };

  users
    .filter((u) => u.uid !== getUserId(user))
    .forEach((u) =>
      groupedUsers[u.role === "mentor" ? "mentor" : "student"].push(u)
    );

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 10 }}>
      {loading ? (
        "Loading..."
      ) : !user ? (
        <Alert message="Please sign in to use messaging." type="warning" />
      ) : (
        <Card
          title={
            <>
              <Badge status={isOnline ? "success" : "default"} /> Messaging System
            </>
          }
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select recipient"
            onChange={setRecipient}
            value={recipient || undefined}
            style={{ width: "100%", marginBottom: 10 }}
          >
            {Object.entries(groupedUsers).map(([role, group]) => (
              <OptGroup key={role} label={role === "mentor" ? "Mentors" : "Students"}>
                {group
                  .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                  .map(({ uid, name, email, photoURL }) => (
                    <Option key={uid} value={uid} label={`${name} (${email})`}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar size="small" src={photoURL}>
                          {name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        {name} ({email})
                      </div>
                    </Option>
                  ))}
              </OptGroup>
            ))}
          </Select>

          {recipient ? (
            <>
              <List
                size="small"
                bordered
                dataSource={messages}
                renderItem={renderMessageItem}
                style={{ maxHeight: 300, overflowY: "auto", marginBottom: 10 }}
                locale={{ emptyText: "No messages yet." }}
              />
              <div ref={messagesEndRef} />
              <Input.TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginBottom: 10 }}
              />
              <Button
                type="primary"
                onClick={sendMessage}
                disabled={!message.trim()}
                block
              >
                Send
              </Button>
            </>
          ) : (
            <Alert message="Select a recipient to start messaging." type="info" />
          )}
        </Card>
      )}
    </div>
  );
};

export default MessagingTab;
