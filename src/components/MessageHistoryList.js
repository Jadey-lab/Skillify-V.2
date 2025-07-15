import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Collapse,
  Avatar,
  Input,
  message as antdMessage,
} from "antd";
import { db } from "./firebaseConfig"; // Adjust path as needed
import { doc, getDoc } from "firebase/firestore";

const { Text } = Typography;
const { Panel } = Collapse;

const getInitials = (email) => {
  if (!email || typeof email !== "string") return "?";
  const name = email.split("@")[0];
  return name
    .split(/[.\-_]/)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const formatDateOnly = (date) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
};

const formatTimeOnly = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MessageHistoryList = ({ messages, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const messageListRefs = useRef({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive inline styles
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const groupedByRecipient = messages.reduce((groups, msg) => {
    const key = msg.recipientEmail || "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
    return groups;
  }, {});

  const filteredRecipients = Object.keys(groupedByRecipient)
    .filter((email) =>
      email.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b)); // alphabetical

  const getFlattenedSortedMessages = (msgs) => {
    let flattened = [];
    msgs.forEach((msg) => {
      const msgTimestamp = msg.createdAt?.toMillis?.()
        ? msg.createdAt.toMillis()
        : new Date(msg.createdAt).getTime();

      flattened.push({
        ...msg,
        type: "message",
        id: msg.id,
        timestamp: msgTimestamp,
      });

      if (msg.replies && msg.replies.length > 0) {
        msg.replies.forEach((reply, idx) => {
          flattened.push({
            ...reply,
            type: "reply",
            parentId: msg.id,
            timestamp: new Date(reply.timestamp).getTime(),
            key: `${msg.id}-reply-${idx}`,
          });
        });
      }
    });

    return flattened.sort((a, b) => a.timestamp - b.timestamp);
  };

  useEffect(() => {
    Object.values(messageListRefs.current).forEach((ref) => {
      ref?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages]);

  // Responsive font size for email text
  const emailFontSize = windowWidth <= 600 ? 13 : 16;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 10,
      }}
    >
      <Input.Search
        placeholder="Search recipients"
        allowClear
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <Collapse accordion>
        {filteredRecipients.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
            No recipients found.
          </div>
        )}

        {filteredRecipients.map((recipientEmail) => {
          const msgs = groupedByRecipient[recipientEmail] || [];
          const flattenedMsgs = getFlattenedSortedMessages(msgs);

          let lastDate = null;

          return (
            <Panel
              key={recipientEmail}
              header={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    flexWrap: "wrap", // responsive wrap
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 8,
                      flexGrow: 1,
                      minWidth: 0,
                    }}
                  >
                    <Avatar>{getInitials(recipientEmail)}</Avatar>
                    <Text
                      strong
                      style={{
                        fontSize: emailFontSize,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minWidth: 0,
                      }}
                      title={recipientEmail}
                    >
                      {recipientEmail}
                    </Text>
                  </div>
                </div>
              }
              style={{ maxHeight: 400, overflowY: "auto" }}
            >
              <div
                style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  paddingRight: 8,
                }}
              >
                {flattenedMsgs.map((item, idx) => {
                  const messageDate = formatDateOnly(
                    item.timestamp || item.createdAt
                  );
                  const showDateSeparator = messageDate !== lastDate;
                  lastDate = messageDate;

                  if (item.type === "message") {
                    const isSent = item.senderId === currentUser?.uid;
                    return (
                      <React.Fragment key={item.id}>
                        {showDateSeparator && (
                          <div
                            style={{
                              textAlign: "center",
                              margin: "16px 0 8px",
                              color: "#999",
                              fontWeight: "600",
                              fontSize: 14,
                            }}
                          >
                            {new Date(messageDate).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        )}
                        <div
                          className={`message-card ${isSent ? "sent" : "received"}`}
                          style={{
                            marginLeft: isSent ? "auto" : undefined,
                            marginRight: !isSent ? "auto" : undefined,
                            padding: 10,
                            borderRadius: 8,
                            wordBreak: "break-word",
                            backgroundColor: isSent ? "#dcf8c6" : "#fff",
                            maxWidth: "75%",
                            marginBottom: 10,
                          }}
                        >
                          <div>{item.message}</div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#555",
                              textAlign: isSent ? "right" : "left",
                              marginTop: 6,
                            }}
                          >
                            {formatTimeOnly(item.timestamp || item.createdAt)}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  } else if (item.type === "reply") {
                    const isMe = item.senderId === currentUser?.uid;
                    const sender = item.senderEmail || "Unknown";
                    return (
                      <div
                        key={item.key || idx}
                        className={`reply-bubble ${isMe ? "me" : "recipient"}`}
                        style={{
                          marginLeft: isMe ? "auto" : 30,
                          padding: 6,
                          borderRadius: 6,
                          fontSize: 13,
                          wordBreak: "break-word",
                          backgroundColor: isMe ? "#e1f3fb" : "#f1f0f0",
                          marginBottom: 6,
                          maxWidth: "90%",
                        }}
                      >
                        <div
                          style={{ fontWeight: "600", fontSize: 11, marginBottom: 2 }}
                        >
                          {sender}
                        </div>
                        <div>{item.text}</div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#666",
                            marginTop: 4,
                            textAlign: "right",
                          }}
                        >
                          {formatTimeOnly(item.timestamp)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                <div
                  ref={(el) => {
                    messageListRefs.current[recipientEmail] = el;
                  }}
                />
              </div>
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
};

export default MessageHistoryList;
