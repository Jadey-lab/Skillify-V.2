import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, DatePicker, Button, List, Select, Modal, message, Spin, Space } from 'antd';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const db = getFirestore();
const auth = getAuth();

const StaffPortal = ({ userProfile, chapter }) => {
  // User role: assume userProfile.role is 'admin' or 'member'
  const [user, setUser] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & form states
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Load current user & data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLeaveRequests(currentUser.uid);
        fetchTasks(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch leave requests for this chapter
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'leaveRequests'),
        where('chapter', '==', chapter),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaveRequests(requests);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks assigned or created by user
  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // For admins: fetch tasks assigned for their chapter
      // For members: fetch tasks assigned to them
      let q;
      if (userProfile?.role === 'admin') {
        q = query(collection(db, 'tasks'), where('chapter', '==', chapter), orderBy('assignedAt', 'desc'));
      } else {
        q = query(collection(db, 'tasks'), where('assignedToUserId', '==', user.uid), orderBy('assignedAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit leave request form handler
  const onLeaveRequestFinish = async (values) => {
    try {
      await addDoc(collection(db, 'leaveRequests'), {
        userId: user.uid,
        chapter,
        startDate: values.dates[0].toISOString(),
        endDate: values.dates[1].toISOString(),
        reason: values.reason,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      message.success('Leave request submitted!');
      fetchLeaveRequests();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      message.error('Failed to submit leave request.');
    }
  };

  // Admin actions: Approve or Reject leave request
  const handleLeaveRequestUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', id), { status: newStatus });
      message.success(`Request ${newStatus}`);
      fetchLeaveRequests();
    } catch (err) {
      console.error('Error updating leave request:', err);
      message.error('Failed to update leave request.');
    }
  };

  // Admin opens task modal
  const openTaskModal = () => {
    setTaskModalVisible(true);
  };

  // Admin submits new task
  const onTaskSubmit = async (values) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        assignedByUserId: user.uid,
        assignedToUserId: values.assignedTo,
        chapter,
        title: values.title,
        description: values.description,
        deadline: values.deadline.toISOString(),
        status: 'pending',
        assignedAt: new Date().toISOString(),
      });
      message.success('Task assigned!');
      setTaskModalVisible(false);
      fetchTasks();
    } catch (err) {
      console.error('Error assigning task:', err);
      message.error('Failed to assign task.');
    }
  };

  // Member submits a task (example: simple "Mark as submitted")
  const submitTask = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: 'submitted' });
      message.success('Task submitted!');
      fetchTasks();
    } catch (err) {
      console.error('Error submitting task:', err);
      message.error('Failed to submit task.');
    }
  };

  // Helper: render leave requests list
  const LeaveRequestsList = () => (
    <List
      header={<Title level={4}>Leave Requests - {chapter}</Title>}
      loading={loading}
      dataSource={leaveRequests}
      renderItem={(item) => (
        <List.Item
          actions={
            userProfile?.role === 'admin' && item.status === 'pending'
              ? [
                  <Button
                    type="link"
                    onClick={() => handleLeaveRequestUpdate(item.id, 'approved')}
                    key="approve"
                  >
                    Approve
                  </Button>,
                  <Button
                    type="link"
                    danger
                    onClick={() => handleLeaveRequestUpdate(item.id, 'rejected')}
                    key="reject"
                  >
                    Reject
                  </Button>,
                ]
              : null
          }
        >
          <List.Item.Meta
            title={`${item.userId} — ${moment(item.startDate).format('YYYY-MM-DD')} to ${moment(item.endDate).format('YYYY-MM-DD')}`}
            description={`Reason: ${item.reason}`}
          />
          <Text strong>Status: {item.status}</Text>
        </List.Item>
      )}
    />
  );

  // Helper: render tasks list for admin or members
  const TasksList = () => (
    <List
      header={<Title level={4}>{userProfile?.role === 'admin' ? 'Tasks Assigned' : 'Your Tasks'}</Title>}
      loading={loading}
      dataSource={tasks}
      renderItem={(task) => (
        <List.Item
          actions={
            userProfile?.role === 'member' && task.status === 'pending'
              ? [
                  <Button
                    type="primary"
                    onClick={() => submitTask(task.id)}
                    key="submit"
                  >
                    Submit Task
                  </Button>,
                ]
              : null
          }
        >
          <List.Item.Meta
            title={task.title}
            description={`Deadline: ${moment(task.deadline).format('YYYY-MM-DD')}\nStatus: ${task.status}`}
          />
        </List.Item>
      )}
    />
  );

  // Task assign form for admin
  const TaskAssignForm = () => {
    const [form] = Form.useForm();
    const [chapterMembers, setChapterMembers] = useState([]);

    useEffect(() => {
      // Fetch chapter members from Firestore 'users' collection with chapter === chapter
      const fetchMembers = async () => {
        try {
          const q = query(collection(db, 'users'), where('chapter', '==', chapter));
          const snapshot = await getDocs(q);
          const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setChapterMembers(members);
        } catch (err) {
          console.error('Error fetching members:', err);
        }
      };
      fetchMembers();
    }, [chapter]);

    return (
      <Form form={form} layout="vertical" onFinish={onTaskSubmit}>
        <Form.Item
          name="assignedTo"
          label="Assign To"
          rules={[{ required: true, message: 'Please select a member' }]}
        >
          <Select placeholder="Select a member">
            {chapterMembers.map(member => (
              <Option key={member.id} value={member.id}>
                {member.firstName} {member.surname}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Task Title" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea rows={4} placeholder="Task details" />
        </Form.Item>
        <Form.Item
          name="deadline"
          label="Deadline"
          rules={[{ required: true, message: 'Please select deadline' }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Assign Task
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, maxWidth: 900, margin: 'auto' }}>
      <Title level={2}>Staff Portal - {chapter}</Title>

      {/* Leave Request Form for members */}
      {userProfile?.role !== 'admin' && (
        <>
          <Title level={4}>Submit Leave Request</Title>
          <Form onFinish={onLeaveRequestFinish} layout="vertical" style={{ maxWidth: 400 }}>
            <Form.Item
              name="dates"
              label="Leave Duration"
              rules={[{ required: true, message: 'Please select leave duration' }]}
            >
              <RangePicker />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Please enter reason for leave' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit Leave Request
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      <br />

      {/* Leave Requests List */}
      <LeaveRequestsList />

      <br />

      {/* Admin only: Task assignment */}
      {userProfile?.role === 'admin' && (
        <>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" onClick={openTaskModal}>
              Assign Task to Member
            </Button>

            <Modal
              title="Assign Task"
              visible={taskModalVisible}
              onCancel={() => setTaskModalVisible(false)}
              footer={null}
            >
              <TaskAssignForm />
            </Modal>

            {/* Tasks List */}
            <TasksList />
          </Space>
        </>
      )}

      {/* Member Tasks List */}
      {userProfile?.role !== 'admin' && (
        <>
          <TasksList />
        </>
      )}
    </div>
  );
};

export default StaffPortal;
