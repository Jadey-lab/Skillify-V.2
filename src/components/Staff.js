import React, { useEffect, useState } from "react";
import {
  Layout,
  Tabs,
  Typography,
  Input,
  Avatar,
  Card,
  Row,
  Col,
  Select,
  Tag,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { db, auth } from "./firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const { Header, Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const roleColors = {
  "Marketing Manager": "purple",
  "Social Media Specialist": "geekblue",
  "Chapter Lead": "volcano",
  "Chapter Member": "cyan",
  "Partnership Manager": "blue",
  "Finance Officer": "gold",
  "Student Engagement": "green",
  default: "gray",
};

const availabilityColors = {
  available: "green",
  busy: "orange",
  leave: "gold",
  inactive: "red",
};

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [executiveTeam, setExecutiveTeam] = useState([]);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentUserFullName, setCurrentUserFullName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  // Load current user data and check staffAccess
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setCurrentUserData({ uid: user.uid, ...data });
          setCurrentUserFullName(`${data.firstName} ${data.surname || ""}`);
        }
      }
      setLoadingUser(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch users only if current user has staffAccess === 'granted'
  useEffect(() => {
    if (!currentUserData || currentUserData.staffAccess !== "granted") return;

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const departmentsArray = [];
        const executives = [];
        const community = [];

        usersSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.firstName) return;

          const fullName = `${data.firstName} ${data.surname || ""}`.trim();

          const availability = data.availability || "available";

          const userEntry = {
            id: docSnap.id,
            name: fullName,
            email: data.email || "N/A",
            role: data.teamRole || "Member",
            availability,
            department: data.department || null,
            priority: data.priority || 4,
            active: data.active ?? true,
          };

          if (data.isExecutive) {
            executives.push(userEntry);
          }

          if (data.department) {
            departmentsArray.push(userEntry);
          } else {
            community.push({
              ...userEntry,
              education: data.education || "N/A",
              fieldOfStudy: data.fieldOfStudy || "N/A",
              mobile: data.mobile || "N/A",
            });
          }
        });

        setDepartmentMembers(departmentsArray);
        setExecutiveTeam(executives);
        setCommunityMembers(community);
      } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Failed to load team data");
      }
    };

    fetchUsers();
  }, [currentUserData]);

  const updateDeptAvailability = async (userId, newAvailability) => {
    setDepartmentMembers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, availability: newAvailability } : user
      )
    );
    try {
      await updateDoc(doc(db, "users", userId), { availability: newAvailability });
    } catch {
      message.error("Failed to update availability");
    }
  };

  const updateExecAvailability = async (id, newAvailability) => {
    setExecutiveTeam((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, availability: newAvailability } : member
      )
    );
    try {
      await updateDoc(doc(db, "users", id), { availability: newAvailability });
    } catch (err) {
      message.error("Failed to update availability");
    }
  };

  const renderRoleTag = (role) => (
    <Tag color={roleColors[role] || roleColors.default}>{role}</Tag>
  );

  const filterMembers = (members) => {
    let filtered = members;
    if (departmentFilter) {
      filtered = filtered.filter((m) => m.department === departmentFilter);
    }
    if (!searchTerm.trim()) return filtered;
    const lower = searchTerm.toLowerCase();
    return filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        (m.email && m.email.toLowerCase().includes(lower)) ||
        (m.role && m.role.toLowerCase().includes(lower))
    );
  };

  const renderDepartmentMembers = () => {
    const filtered = filterMembers(departmentMembers);
    const sorted = [...filtered].sort((a, b) => (a.priority || 4) - (b.priority || 4));

    const departmentOptions = [
      ...new Set(departmentMembers.map((u) => u.department).filter(Boolean)),
    ];

    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text strong>Total Department Members: {filtered.length}</Text>
          <Select
            placeholder="Filter by Department"
            style={{ width: 200 }}
            allowClear
            value={departmentFilter || undefined}
            onChange={(val) => setDepartmentFilter(val || "")}
          >
            {departmentOptions.map((dep) => (
              <Option key={dep} value={dep}>
                {dep}
              </Option>
            ))}
          </Select>
        </div>
        <Row gutter={[24, 24]}>
          {sorted.length > 0 ? (
            sorted.map(({ id, name, email, role, department, availability }) => (
              <Col
                key={id}
                xs={24}
                sm={12}
                md={8}
                lg={6}
                style={{ display: "flex" }}
              >
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 200,
                  }}
                  actions={[
                    <Select
                      key="availability"
                      size="small"
                      value={availability}
                      onChange={(val) => updateDeptAvailability(id, val)}
                      disabled={id !== currentUserData?.uid}
                      style={{ width: 120 }}
                    >
                      <Option value="available">Available</Option>
                      <Option value="busy">Busy</Option>
                      <Option value="leave">Leave</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>,
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div
                        style={{
                          fontWeight: 600,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div>{name}</div>
                        <Tag
                          color={availabilityColors[availability]}
                          style={{ width: "fit-content" }}
                        >
                          ● {availability.toUpperCase()}
                        </Tag>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: 12, marginTop: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <MailOutlined style={{ marginRight: 8 }} />
                          {email}
                        </div>
                        <div>
                          <strong>Department:</strong> {department}
                        </div>
                        {renderRoleTag(role)}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Text type="secondary">No department members found.</Text>
            </Col>
          )}
        </Row>
      </>
    );
  };

  const renderCommunityMembers = () => {
    const filteredCommunity = filterMembers(communityMembers);

    return (
      <>
        <Text strong style={{ marginBottom: 16, display: "block" }}>
          Total Community Members: {communityMembers.length}
        </Text>
        <Row gutter={[24, 24]}>
          {filteredCommunity.length > 0 ? (
            filteredCommunity.map(
              ({ id, name, email, education, fieldOfStudy, mobile }) => (
                <Col
                  key={id}
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  style={{ display: "flex" }}
                >
                  <Card
                    hoverable
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 220,
                    }}
                    bodyStyle={{ flexGrow: 1 }}
                  >
                    <Card.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={<div style={{ fontWeight: 600 }}>{name}</div>}
                      description={
                        <div style={{ fontSize: 12 }}>
                          <p>
                            <strong>Email:</strong> {email}
                          </p>
                          <p>
                            <strong>Education:</strong> {education}
                          </p>
                          <p>
                            <strong>Field:</strong> {fieldOfStudy}
                          </p>
                          <p>
                            <strong>Mobile:</strong> {mobile}
                          </p>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              )
            )
          ) : (
            <Col span={24}>
              <Text type="secondary">No community members found.</Text>
            </Col>
          )}
        </Row>
      </>
    );
  };

  const renderOffice = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <Card title="Executive Team">
          <Row gutter={[16, 16]}>
            {executiveTeam.map(({ id, name, email, role, availability }) => (
              <Col xs={24} sm={12} md={8} lg={6} key={id}>
                <Card>
                  <Card.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {name}
                        <Select
                          size="small"
                          value={availability}
                          onChange={(val) => updateExecAvailability(id, val)}
                          disabled={id !== currentUserData?.uid}
                          style={{ width: 100 }}
                        >
                          <Option value="available">Available</Option>
                          <Option value="busy">Busy</Option>
                          <Option value="leave">Leave</Option>
                          <Option value="inactive">Inactive</Option>
                        </Select>
                      </div>
                    }
                    description={
                      <>
                        <Tag color={availabilityColors[availability]}>
                          ● {availability.toUpperCase()}
                        </Tag>{" "}
                        {renderRoleTag(role)}
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
    </Row>
  );

  if (loadingUser) {
    return (
      <Layout style={{ background: "#fff", minHeight: "100vh" }}>
        <Content style={{ padding: 24, textAlign: "center" }}>
          <Text>Loading user data...</Text>
        </Content>
      </Layout>
    );
  }

  if (!currentUserData || currentUserData.staffAccess !== "granted") {
    return (
      <Layout style={{ background: "#fff", minHeight: "100vh" }}>
        <Content style={{ padding: 24, textAlign: "center" }}>
          <Text type="danger" style={{ fontSize: 18 }}>
            Access Denied. You do not have permission to view this page.
          </Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ background: "#fff" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search members by name, email, or role"
          style={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Text strong>
          {currentUserData
            ? `Logged in as ${currentUserFullName} (${
                currentUserData.tertiaryRole ||
                currentUserData.teamRole ||
                "Member"
              })`
            : "Not logged in"}
        </Text>
      </Header>
      <Content style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ marginBottom: 24 }}
        >
          <TabPane tab="Dashboard" key="dashboard" />
          <TabPane tab="Department" key="department" />
          <TabPane tab="Office" key="office" />
          <TabPane tab="Community Members" key="community" />
        </Tabs>

        {activeTab === "department"
          ? renderDepartmentMembers()
          : activeTab === "office"
          ? renderOffice()
          : activeTab === "community"
          ? renderCommunityMembers()
          : null}
      </Content>
    </Layout>
  );
};

export default StaffDashboard;
