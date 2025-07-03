import React from "react";
import { Card, Avatar, Button, Typography } from "antd";
import { UserOutlined, CrownOutlined, MessageOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const StaffCard = ({ name, role, email }) => (
  <Card style={{ marginBottom: 16 }} bordered hoverable>
    <Card.Meta
      avatar={
        <Avatar icon={role.toLowerCase().includes("executive") ? <CrownOutlined /> : <UserOutlined />} />
      }
      title={<Title level={5} style={{ margin: 0 }}>{name}</Title>}
      description={
        <>
          <Text type="secondary">{role}</Text><br />
          <Text>{email}</Text>
        </>
      }
    />
    <div style={{ marginTop: 8, textAlign: "right" }}>
      <Button icon={<MessageOutlined />} size="small">
        Message
      </Button>
    </div>
  </Card>
);

export default StaffCard;
