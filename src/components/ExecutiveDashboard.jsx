import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { TeamOutlined, FileDoneOutlined } from "@ant-design/icons";

const ExecutiveDashboard = ({ totalStaff, tasksApproved }) => (
  <Row gutter={16} style={{ marginBottom: 24 }}>
    <Col span={12}>
      <Card>
        <Statistic title="Total Staff" value={totalStaff} prefix={<TeamOutlined />} />
      </Card>
    </Col>
    <Col span={12}>
      <Card>
        <Statistic title="Tasks Approved" value={tasksApproved} prefix={<FileDoneOutlined />} />
      </Card>
    </Col>
  </Row>
);

export default ExecutiveDashboard;
