import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ResourcesPage = () => {
  const { chapterId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Resources – {chapterId.toUpperCase()}</Title>
      <Paragraph>Access learning and mentoring materials for {chapterId} here.</Paragraph>
    </div>
  );
};

export default ResourcesPage;
