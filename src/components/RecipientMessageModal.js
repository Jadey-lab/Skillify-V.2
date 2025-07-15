import React, { useState, useEffect } from "react";
import { Modal, Input, DatePicker, message } from "antd";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

const { TextArea } = Input;

const ReplyToMessageModal = ({ visible, onCancel, originalMessage, currentUserEmail, onMessageSent }) => {
  const [messageText, setMessageText] = useState("");
  const [sessionDate, setSessionDate] = useState(null);
  const [resourceLink, setResourceLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setMessageText("");
      setSessionDate(null);
      setResourceLink("");
      setLoading(false);
    }
  }, [visible]);

  const handleSend = async () => {
    if (!sessionDate) return message.error("Please select a session date.");
    if (!messageText.trim()) return message.error("Please enter a message.");

    const dataToSend = {
      mentorId: currentUserEmail,
      recipientEmail: originalMessage.mentorId || originalMessage.recipientEmail,
      message: messageText.trim(),
      sessionDate: sessionDate.toDate(),
      resourceLink: resourceLink.trim() || null,
      createdAt: serverTimestamp(),
      readBy: [],
      replies: [],
    };

    setLoading(true);
    try {
      await addDoc(collection(db, "mentorMessages"), dataToSend);
      message.success({
        content: `Reply sent to ${dataToSend.recipientEmail}`,
        duration: 4,
        style: { marginTop: "10vh", fontWeight: "bold" },
      });
      onCancel();
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error("Send reply error:", err);
      message.error("Failed to send reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      onOk={handleSend}
      confirmLoading={loading}
      title={`Reply to ${originalMessage?.mentorId || originalMessage?.recipientEmail}`}
      okText="Send Reply"
    >
      <TextArea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Reply message"
        rows={4}
        disabled={loading}
      />
      <br />
      <br />
      <DatePicker
        style={{ width: "100%" }}
        onChange={setSessionDate}
        placeholder="Select session date"
        disabled={loading}
      />
      <br />
      <br />
      <Input
        value={resourceLink}
        onChange={(e) => setResourceLink(e.target.value)}
        placeholder="Resource Link (optional)"
        disabled={loading}
      />
    </Modal>
  );
};

export default ReplyToMessageModal;
