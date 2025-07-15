import React, { useState } from "react";
import { Input, Button, message as antdMessage } from "antd";
import { Send } from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig"; // adjust if path is different

const RepliesSection = ({ mentorMessageId, mentorId, user }) => {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const handleReplySend = async () => {
    if (!reply.trim()) return;
    setSending(true);

    try {
      await addDoc(collection(db, "mentorReplies"), {
        mentorMessageId,              // links to original message
        senderId: user.uid,           // current user (student)
        recipientId: mentorId,        // send to the mentor
        replyMessage: reply.trim(),
        timestamp: serverTimestamp(),
      });

      setReply("");
      antdMessage.success("Reply sent!");
    } catch (err) {
      console.error("Failed to send reply:", err);
      antdMessage.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <Input.TextArea
        rows={2}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Type your reply..."
        style={{ marginBottom: 8 }}
      />
      <Button
        icon={<Send />}
        type="primary"
        onClick={handleReplySend}
        loading={sending}
        disabled={!reply.trim()}
      >
        Send
      </Button>
    </div>
  );
};

export default RepliesSection;
