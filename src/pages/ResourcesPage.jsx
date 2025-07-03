import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';
import BackButton from '../components/BackButton';
const { Title, Paragraph } = Typography;

const ResourcesPage = () => {
  const { chapterId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Resources – {chapterId.toUpperCase()}</Title>
      <Paragraph>Access learning and mentoring materials for {chapterId} here.</Paragraph>
   {/* Back Button fixed to bottom right */}
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

export default ResourcesPage;
