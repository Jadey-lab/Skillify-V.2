
import React from 'react';
import { Card, Avatar, Button, Row, Col, Statistic } from 'antd';
import { MessageOutlined, UserAddOutlined } from '@ant-design/icons';

const { Meta } = Card;

const StudentBioCard = () => {
  return (
    <Card style={{ width: 500, borderRadius: 15 }} bodyStyle={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        {/* Student Avatar */}
        <Col 
          span={8} 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <Avatar 
            size={120} 
            src="https://randomuser.me/api/portraits/men/75.jpg" 
          />
        </Col>

        {/* Student Details */}
        <Col span={16}>
          <Meta
            title="John Doe"
            description="Computer Science Major, Class of 2026"
          />

          {/* Statistics */}
          <Row style={{ marginTop: 16 }}>
            <Col span={8}>
              <Statistic title="Courses" value={8} />
            </Col>
            <Col span={8}>
              <Statistic title="GPA" value={3.8} precision={2} />
            </Col>
            <Col span={8}>
              <Statistic title="Credits" value={45} />
            </Col>
          </Row>

          {/* Action Buttons */}
          <div style={{ marginTop: 16 }}>
            <Button 
              type="primary" 
              icon={<MessageOutlined />} 
              style={{ marginRight: 8 }}
            >
              Message
            </Button>
            <Button icon={<UserAddOutlined />}>
              Connect
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default StudentBioCard;
