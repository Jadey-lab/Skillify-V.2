import React from "react";
import { Card, Button } from "antd";

const DashboardTab = () => (
  <Card title="Overview" bordered={false}>
    <p>Quick insights about your mentorship activities.</p>
    <Button type="primary" style={{ marginTop: "10px" }}>
      Update Profile & Settings
    </Button>
  </Card>
);

export default DashboardTab;
