import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';
import BackButton from '../components/BackButton'; // Update path if needed

const { Title, Paragraph } = Typography;

const EventsPage = () => {
  const { chapterId } = useParams();

  return (
    <div style={{ padding: 24, position: 'relative', minHeight: '100vh' }}>
      <Title level={3}>Events – {chapterId.toUpperCase()}</Title>
      <Paragraph>View upcoming events for the {chapterId} chapter.</Paragraph>

      {/* Floating Back Button */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <BackButton />
      </div>
    </div>
  );
};

export default EventsPage;
