import React, { useState } from "react";
import {
  Layout,
  Tabs,
  Typography,
  Input,
  Avatar,
  Card,
  Row,
  Col,
  Button,
  Calendar,
  Space,
  Divider,
  List,
  Modal,
  Form,
  message,
  Select,
  DatePicker,
  Badge,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  NotificationOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Initial sample data for staff, announcements, exec team, departments
const initialStaff = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Marketing Manager",
    department: "Social Media & Marketing",
  },
  {
    id: 2,
    name: "Bob Smith",
    role: "Research Analyst",
    department: "Research",
  },
  {
    id: 3,
    name: "Carol Lee",
    role: "Finance Specialist",
    department: "Finance Team",
  },
];

const initialAnnouncements = [
  { id: 1, text: "All-hands meeting Friday at 10am" },
  { id: 2, text: "Submit performance reviews" },
];

const executiveTeam = [
  {
    id: 1,
    name: "Dr. Emily Carter",
    role: "CEO",
  },
  {
    id: 2,
    name: "Michael Thompson",
    role: "CFO",
  },
  {
    id: 3,
    name: "Samantha Green",
    role: "COO",
  },
];

const departmentsData = {
  "Social Media & Marketing": [
    { id: 101, name: "Alice Johnson", role: "Marketing Manager" },
    { id: 102, name: "David Park", role: "Social Media Specialist" },
  ],
  Partnerships: [{ id: 201, name: "James Wilson", role: "Partnership Manager" }],
  "Student Engagement": [
    { id: 301, name: "Karen Davis", role: "Student Engagement Lead" },
  ],
  Research: [
    { id: 401, name: "Bob Smith", role: "Research Analyst" },
    { id: 402, name: "Lucy Brown", role: "Lab Technician" },
  ],
  "Chapters Team": [{ id: 501, name: "Tom Harris", role: "Chapters Coordinator" }],
  "Finance Team": [{ id: 601, name: "Carol Lee", role: "Finance Specialist" }],
};

const availabilityStatuses = {
  1: "available", // green
  2: "busy", // orange
  3: "offline", // red
};

const availabilityColors = {
  available: "green",
  busy: "orange",
  offline: "red",
};

const virtualOfficesData = [
  {
    id: 1,
    name: "Dr. Emily Carter",
    role: "CEO",
    officeDescription:
      "Office 101, Main Building — Available 9am–5pm weekdays. Reach out for strategic discussions.",
    email: "emily.carter@yourorg.org",
    phone: "+27 123 456 7890",
    zoomLink: "https://zoom.us/j/1234567890",
    teamsLink: "https://teams.microsoft.com/l/meetup-join/abc123",
    slackLink: "https://yourorg.slack.com/team/emily",
  },
  {
    id: 2,
    name: "Michael Thompson",
    role: "CFO",
    officeDescription:
      "Office 102, Finance Wing — Available 10am–4pm. For financial queries and budget meetings.",
    email: "michael.thompson@yourorg.org",
    phone: "+27 234 567 8901",
    zoomLink: "https://zoom.us/j/0987654321",
    teamsLink: "https://teams.microsoft.com/l/meetup-join/def456",
    slackLink: "https://yourorg.slack.com/team/michael",
  },
  {
    id: 3,
    name: "Samantha Green",
    role: "COO",
    officeDescription:
      "Office 103, Operations Center — Available 8am–4pm. Contact for operational planning and support.",
    email: "samantha.green@yourorg.org",
    phone: "+27 345 678 9012",
    zoomLink: "https://zoom.us/j/1122334455",
    teamsLink: "https://teams.microsoft.com/l/meetup-join/ghi789",
    slackLink: "https://yourorg.slack.com/team/samantha",
  },
];

const IntranetDashboardWithTabs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Staff & Announcements
  const [staff, setStaff] = useState(initialStaff);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  // Staff modal
  const [isStaffModalVisible, setStaffModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  // Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveFormVisible, setLeaveFormVisible] = useState(false);
  const [leaveForm] = Form.useForm();

  // Announcement input
  const [newAnnouncement, setNewAnnouncement] = useState("");

  // STAFF MODAL HANDLERS
  const openStaffModal = (staffMember = null) => {
    setEditingStaff(staffMember);
    form.setFieldsValue(staffMember || { name: "", role: "", department: "" });
    setStaffModalVisible(true);
  };
  const closeStaffModal = () => {
    form.resetFields();
    setEditingStaff(null);
    setStaffModalVisible(false);
  };
  const handleStaffSubmit = (values) => {
    if (editingStaff) {
      setStaff((prev) =>
        prev.map((s) => (s.id === editingStaff.id ? { ...s, ...values } : s))
      );
      message.success("Staff member updated");
    } else {
      setStaff((prev) => [...prev, { id: Date.now(), ...values }]);
      message.success("Staff member added");
    }
    closeStaffModal();
  };
  const deleteStaff = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    message.success("Staff member deleted");
  };

  // ANNOUNCEMENTS HANDLERS
  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setAnnouncements((prev) => [
      ...prev,
      { id: Date.now(), text: newAnnouncement.trim() },
    ]);
    setNewAnnouncement("");
    message.success("Announcement added");
  };
  const deleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    message.success("Announcement deleted");
  };

  // LEAVE REQUEST HANDLERS
  const showLeaveForm = () => {
    leaveForm.resetFields();
    setLeaveFormVisible(true);
  };
  const closeLeaveForm = () => setLeaveFormVisible(false);

  const submitLeaveRequest = (values) => {
    const newRequest = {
      id: Date.now(),
      employeeName: values.employeeName,
      department: values.department,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
      reason: values.reason,
      status: "pending",
    };
    setLeaveRequests((prev) => [...prev, newRequest]);
    message.success("Leave request submitted");
    closeLeaveForm();
  };

  // Approve / Reject leave requests (admin)
  const updateLeaveStatus = (id, status) => {
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );
    message.success(`Leave request ${status}`);
  };

  // RENDER FUNCTIONS

  const renderDashboard = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={12}>
        <Card bordered style={{ height: "100%" }}>
          <Title level={4}>Good Morning, Laci 👋</Title>
          <Text>It's 27°C and sunny today. Wishing you a productive day!</Text>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card
          cover={
            <img
              alt="Team working"
              src="https://via.placeholder.com/600x200"
              style={{ objectFit: "cover" }}
            />
          }
          bordered
        />
      </Col>

      <Col xs={24} md={8}>
        <Card title="Our Values" bordered>
          <ul style={{ paddingLeft: 20 }}>
            <li>Integrity</li>
            <li>Innovation</li>
            <li>Teamwork</li>
          </ul>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Staff Poll" bordered>
          <Text>Are you satisfied with remote work?</Text>
          <div style={{ marginTop: 16 }}>
            <Button block type="primary">
              Yes
            </Button>
            <Button block style={{ marginTop: 8 }}>
              No
            </Button>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Latest Announcements" bordered>
          <ul style={{ paddingLeft: 20 }}>
            {announcements.map((a) => (
              <li key={a.id}>{a.text}</li>
            ))}
          </ul>
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card title="Upcoming Events" bordered>
          <ul style={{ paddingLeft: 20 }}>
            <li>🎓 Intern Orientation – Monday</li>
            <li>💼 Finance Training – Friday</li>
          </ul>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Calendar" bordered>
          <Calendar fullscreen={false} />
        </Card>
      </Col>

      <Col span={24} style={{ textAlign: "center" }}>
        <Button type="default" size="large">
          Load more activities...
        </Button>
      </Col>
    </Row>
  );

  const renderDepartments = () => (
    <Card title="Departments Overview" bordered>
      {Object.entries(departmentsData).map(([deptName, members]) => (
        <div key={deptName} style={{ marginBottom: 32 }}>
          <Title level={4}>{deptName}</Title>
          <Row gutter={[16, 16]}>
            {members.map(({ id, name, role }) => (
              <Col xs={24} sm={12} md={8} lg={6} key={id}>
                <Card hoverable>
                  <Card.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={name}
                    description={role}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Card>
  );

  const renderExecutiveTeam = () => (
    <Card title="Executive Team" bordered>
      <Row gutter={[16, 16]}>
        {executiveTeam.map(({ id, name, role }) => (
          <Col xs={24} sm={12} md={8} lg={6} key={id}>
            <Card hoverable>
              <Card.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={name}
                description={role}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  const renderVirtualOffices = () => (
    <Card title="Executive Team Virtual Offices" bordered>
      <Row gutter={[24, 24]}>
        {virtualOfficesData.map(
          ({
            id,
            name,
            role,
            officeDescription,
            email,
            phone,
            zoomLink,
            teamsLink,
            slackLink,
          }) => {
            const status = availabilityStatuses[id] || "offline";
            return (
              <Col xs={24} sm={12} md={8} key={id}>
                <Card hoverable style={{ height: "100%" }}>
                  <Card.Meta
                    avatar={
                      <Badge
                        dot
                        offset={[0, 40]}
                        color={availabilityColors[status]}
                      >
                        <Avatar icon={<UserOutlined />} size={64} />
                      </Badge>
                    }
                    title={
                      <>
                        {name} — {role}{" "}
                        <Badge
                          color={availabilityColors[status]}
                          text={
                            status.charAt(0).toUpperCase() + status.slice(1)
                          }
                        />
                      </>
                    }
                    description={
                      <>
                        <p>{officeDescription}</p>
                        <p>
                          📧{" "}
                          <a
                            href={`mailto:${email}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {email}
                          </a>
                          <br />
                          📞 {phone}
                        </p>

                        <Space>
                          {zoomLink && (
                            <Button
                              type="link"
                              href={zoomLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Start Zoom Meeting
                            </Button>
                          )}
                          {teamsLink && (
                            <Button
                              type="link"
                              href={teamsLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Join Teams Call
                            </Button>
                          )}
                          {slackLink && (
                            <Button
                              type="link"
                              href={slackLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Chat on Slack
                            </Button>
                          )}
                        </Space>
                      </>
                    }
                  />
                </Card>
              </Col>
            );
          }
        )}
      </Row>
    </Card>
  );

  const renderAdminPanel = () => (
    <>
      <Card
        title="Manage Staff"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openStaffModal()}>
            Add Staff
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <List
          dataSource={staff}
          renderItem={({ id, name, role, department }) => (
            <List.Item
              actions={[
                <Button
                  icon={<EditOutlined />}
                  onClick={() =>
                    openStaffModal({ id, name, role, department })
                  }
                  key="edit"
                />,
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => deleteStaff(id)}
                  key="delete"
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={name}
                description={`${role} — ${department}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        title="Manage Announcements"
        style={{ marginBottom: 24 }}
        extra={
          <Input.Search
            enterButton="Add"
            placeholder="New announcement"
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            onSearch={addAnnouncement}
            allowClear
            style={{ maxWidth: 400 }}
          />
        }
      >
        <List
          dataSource={announcements}
          renderItem={({ id, text }) => (
            <List.Item
              actions={[
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => deleteAnnouncement(id)}
                  key="delete"
                />,
              ]}
            >
              {text}
            </List.Item>
          )}
        />
      </Card>

      <Modal
        visible={isStaffModalVisible}
        title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
        onCancel={closeStaffModal}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStaffSubmit}
          initialValues={{ name: "", role: "", department: "" }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please enter a role" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Please select a department" }]}
          >
            <Select>
              {Object.keys(departmentsData).map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  const renderLeaveRequests = () => (
    <>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={showLeaveForm}
        icon={<PlusOutlined />}
      >
        Submit Leave Request
      </Button>

      <List
        bordered
        dataSource={leaveRequests}
        locale={{ emptyText: "No leave requests yet." }}
        renderItem={({
          id,
          employeeName,
          department,
          startDate,
          endDate,
          reason,
          status,
        }) => (
          <List.Item
            actions={
              status === "pending"
                ? [
                    <Button
                      icon={<CheckOutlined />}
                      type="primary"
                      onClick={() => updateLeaveStatus(id, "approved")}
                      key="approve"
                    >
                      Approve
                    </Button>,
                    <Button
                      icon={<CloseOutlined />}
                      danger
                      onClick={() => updateLeaveStatus(id, "rejected")}
                      key="reject"
                    >
                      Reject
                    </Button>,
                  ]
                : []
            }
          >
            <List.Item.Meta
              title={`${employeeName} (${department}) — ${status.toUpperCase()}`}
              description={
                <>
                  <p>
                    Leave from <b>{startDate}</b> to <b>{endDate}</b>
                  </p>
                  <p>Reason: {reason}</p>
                </>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Submit Leave Request"
        visible={leaveFormVisible}
        onCancel={closeLeaveForm}
        onOk={() => leaveForm.submit()}
        okText="Submit"
      >
        <Form form={leaveForm} layout="vertical" onFinish={submitLeaveRequest}>
          <Form.Item
            label="Employee Name"
            name="employeeName"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Please select your department" }]}
          >
            <Select>
              {Object.keys(departmentsData).map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            dependencies={["startDate"]}
            rules={[
              { required: true, message: "Please select end date" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("startDate") || value.isSameOrAfter(getFieldValue("startDate"))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("End date must be the same or after start date")
                  );
                },
              }),
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  const renderDocuments = () => (
    <Card title="Documents" bordered>
      <ul>
        <li>
          <a href="#">📄 Staff Handbook.pdf</a>
        </li>
        <li>
          <a href="#">📄 Leave Policy.docx</a>
        </li>
        <li>
          <a href="#">📄 Branding Guide.pdf</a>
        </li>
      </ul>
    </Card>
  );

  const renderCalendar = () => (
    <Card title="Full Calendar" bordered>
      <Calendar fullscreen />
    </Card>
  );

  const renderHelp = () => (
    <Card title="Help & Support" bordered>
      <Text>If you need assistance, reach out via the channels below:</Text>
      <Divider />
      <p>📧 Email: support@yourorg.org</p>
      <p>📞 Phone: 0800-123-456</p>
    </Card>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "executive":
        return renderExecutiveTeam();
      case "virtualOffices":
        return renderVirtualOffices();
      case "departments":
        return renderDepartments();
      case "admin":
        return renderAdminPanel();
      case "leave":
        return renderLeaveRequests();
      case "documents":
        return renderDocuments();
      case "calendar":
        return renderCalendar();
      case "help":
        return renderHelp();
      default:
        return null;
    }
  };

  return (
    <Layout style={{ background: "#fff" }}>
      {/* Top Header */}
      <Header
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          style={{ width: 300 }}
        />
        <div>
          <NotificationOutlined style={{ fontSize: 20, marginRight: 16 }} />
          <Avatar icon={<UserOutlined />} />
        </div>
      </Header>

      {/* Content */}
      <Content style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ marginBottom: 24 }}
        >
          <TabPane tab="Dashboard" key="dashboard" />
          <TabPane tab="Executive Team" key="executive" />
          <TabPane tab="Virtual Offices" key="virtualOffices" />
          <TabPane tab="Departments" key="departments" />
          <TabPane tab="Admin Panel" key="admin" />
          <TabPane tab="Leave Requests" key="leave" />
          <TabPane tab="Documents" key="documents" />
          <TabPane tab="Calendar" key="calendar" />
          <TabPane tab="Help & Support" key="help" />
        </Tabs>

        {getTabContent()}
      </Content>
    </Layout>
  );
};

export default IntranetDashboardWithTabs;
