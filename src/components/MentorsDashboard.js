import React, { useState, useEffect } from "react";
import { Layout, Tabs } from "antd";
import {
  CalendarOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

import MentorshipRequestsTab from "./MentorshipRequestsTab";
import SessionSchedulingTab from "./SessionSchedulingTab";
import AnalyticsTab from "./AnalyticsTab";

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const MentorsDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [mentorID, setMentorID] = useState(null);
  const [mentorFirstName, setMentorFirstName] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === "admin" || userData.role === "mentor") {
              setHasAccess(true);
              setMentorID(userData.mentorID);
              setMentorFirstName(userData.firstName);
            } else {
              setHasAccess(false);
            }
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user info: ", error);
        }
      }
    };

    fetchUserInfo();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Please log in to access the dashboard.</div>;
  if (!hasAccess) {
    return <div>Access Denied. You do not have sufficient privileges.</div>;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: 0,
          textAlign: "center",
          fontSize: "20px",
        }}
      >
        {mentorFirstName
          ? `Welcome, Mentor ${mentorFirstName}`
          : "Welcome, Mentor"}
      </Header>
      <Content style={{ margin: "20px" }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane
            tab={
              <span>
                <UsergroupAddOutlined /> Mentorship Requests
              </span>
            }
            key="requests"
          >
            <MentorshipRequestsTab uid={user.uid} mentorID={mentorID} />
          </TabPane>
          <TabPane
            tab={
              <span>
                <CalendarOutlined /> Session Scheduling
              </span>
            }
            key="sessions"
          >
            <SessionSchedulingTab />
          </TabPane>
          <TabPane
            tab={
              <span>
                <BarChartOutlined /> Analytics & Insights
              </span>
            }
            key="analytics"
          >
            <AnalyticsTab />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default MentorsDashboard;
