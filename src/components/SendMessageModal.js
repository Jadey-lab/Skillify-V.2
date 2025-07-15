import React, { useState, useEffect } from "react";
import { Modal, Select, Input, DatePicker, message } from "antd";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

const { TextArea } = Input;
const { Option } = Select;

const SendMessageModal = ({ visible, onCancel, recipients, mentorId, onMessageSent }) => {
  const [messageText, setMessageText] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [sessionDate, setSessionDate] = useState(null);
  const [meetLink, setMeetLink] = useState("");
  const [resourceLink, setResourceLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setMessageText("");
      setRecipient(null);
      setSessionDate(null);
      setMeetLink("");
      setResourceLink("");
      setLoading(false);
    }
  }, [visible]);

  const handleSend = async () => {
    console.log("handleSend triggered");

    if (!recipient) {
      console.log("Validation failed: No recipient selected");
      return message.error("Please select a recipient.");
    }
    if (!sessionDate) {
      console.log("Validation failed: No session date selected");
      return message.error("Please select a session date.");
    }
    if (!messageText.trim()) {
      console.log("Validation failed: Message text empty");
      return message.error("Please enter a message.");
    }

    const dataToSend = {
      mentorId,
      recipientEmail: recipient,
      message: messageText.trim(),
      sessionDate: sessionDate.toDate(),
      meetLink: meetLink.trim() || null,
      resourceLink: resourceLink.trim() || null,
      createdAt: serverTimestamp(),
      readBy: [],
      replies: [], // i can keep this for backward compatibility or remove it when i  want to fully separate replies
    };

    console.log("Sending message with data:", dataToSend);

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "mentorMessages"), dataToSend);
      console.log("Message sent successfully, doc ID:", docRef.id);

      message.success({
        content: `Message sent to ${recipient}`,
        duration: 4,
        style: {
          marginTop: "10vh",
          fontWeight: "bold",
        },
      });

      onCancel(); // Close modal
      if (onMessageSent) onMessageSent(); // Notify parent if needed
    } catch (err) {
      console.error("Send message error:", err);
      message.error("Failed to send message. Please try again.");
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
      title="Send Message"
      okText="Send"
    >
      <Select
        placeholder="Select recipient"
        value={recipient}
        onChange={setRecipient}
        style={{ width: "100%", marginBottom: 16 }}
        showSearch
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        disabled={loading}
      >
        {recipients.map((r) => (
          <Option key={r.email} value={r.email}>
            {r.email} ({r.name})
          </Option>
        ))}
      </Select>

      <TextArea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Message"
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
        value={meetLink}
        onChange={(e) => setMeetLink(e.target.value)}
        placeholder="Meet Link (optional)"
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

export default SendMessageModal;
