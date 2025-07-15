import React, { useState } from "react";
import {
  Row,
  Col,
  List,
  Select,
  Button,
  Spin,
  message,
  Input,
  Checkbox,
  Modal,
} from "antd";
import { doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getStatusTag } from "./utils";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { getAuth } from "firebase/auth";

const { Option } = Select;
const { TextArea } = Input;

const RequestItem = ({
  request,
  readonly,
  setRequests,
  setAcceptedRequests,
  setWaitlistedRequests,
  setRejectedRequests,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedChecked, setCompletedChecked] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const mentorId = currentUser?.uid || "unknown";

  if (!request || typeof request !== "object" || !request.name) return null;

  const handleDelete = () => {
    Modal.confirm({
      title: "Confirm delete?",
      onOk: async () => {
        await deleteDoc(doc(db, "mentorBookings", request.id));
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
        message.success("Deleted.");
      },
    });
  };

  const findAndDeleteExisting = async () => {
    const collections = [
      "mentorBookings",
      "acceptedRequests",
      "waitlistedRequests",
      "rejectedRequests",
    ];
    for (const c of collections) {
      const ref = doc(db, c, request.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        return snap.data();
      }
    }
    return null;
  };

  const handleSend = async () => {
    if (!selectedStatus) return;
    setLoadingBtn(true);
    const data = await findAndDeleteExisting();
    if (!data) {
      setLoadingBtn(false);
      return;
    }
    const target = {
      Accepted: setAcceptedRequests,
      Waitlisted: setWaitlistedRequests,
      Rejected: setRejectedRequests,
    };
    await setDoc(doc(db, `${selectedStatus.toLowerCase()}Requests`, request.id), {
      ...data,
      status: selectedStatus,
      processedAt: new Date(),
    });
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
    target[selectedStatus]((prev) => [...prev, { ...data, id: request.id }]);
    setLoadingBtn(false);
    message.success("Status updated");
  };

  const handleComplete = async () => {
    if (!completedChecked) {
      message.warning("Please check 'Mark as Completed' before submitting.");
      return;
    }

    setCompleting(true);

    try {
      const completedData = {
        ...request,
        completedAt: new Date(),
        status: "Completed",
        notes: notes.trim(),
        mentorId: mentorId,
      };

      await setDoc(doc(db, "completedSessions", request.id), completedData);
      await deleteDoc(doc(db, "mentorBookings", request.id));
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      message.success("Session marked as completed");

      // Reset state
      setCompletedChecked(false);
      setNotes("");
      setShowNotes(false);
    } catch (error) {
      console.error("Failed to mark as completed:", error);
      message.error("Could not complete session");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <List.Item>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <List.Item.Meta
            title={
              <>
                {request.name}'s Request - {getStatusTag(request.status)}
              </>
            }
            description={`Email: ${request.email} | Field: ${request.fieldOfStudy} | Year: ${request.yearOfStudy}`}
          />

          <Checkbox
            checked={completedChecked}
            onChange={(e) => setCompletedChecked(e.target.checked)}
            style={{ marginTop: 8 }}
          >
            Mark as Completed
          </Checkbox>

          <Button
            type="link"
            onClick={() => setShowNotes((prev) => !prev)}
            style={{
              paddingLeft: 0,
              marginTop: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            <EditNoteIcon style={{ marginRight: 6 }} />
            {showNotes ? "Hide Notes" : "Add Notes"}
          </Button>

          {showNotes && (
            <TextArea
              rows={4}
              placeholder="Session notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </Col>

        {!readonly && (
          <Col xs={24} md={8}>
            <Select
              placeholder="Select status"
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              value={selectedStatus}
            >
              <Option value="Accepted">Accept</Option>
              <Option value="Waitlisted">Waitlist</Option>
              <Option value="Rejected">Reject</Option>
            </Select>

            <Button
              onClick={handleSend}
              type="primary"
              block
              style={{ marginTop: 8 }}
              disabled={!selectedStatus}
              loading={loadingBtn}
            >
              Send Feedback
            </Button>

            <Button danger block onClick={handleDelete} style={{ marginTop: 8 }}>
              Delete Request
            </Button>

            <Button
              block
              type="dashed"
              onClick={handleComplete}
              loading={completing}
              style={{ marginTop: 8 }}
            >
              Save Completed Session
            </Button>
          </Col>
        )}
      </Row>
    </List.Item>
  );
};

export default RequestItem;
