import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const HighlightsPage = () => {
  const { chapterId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Highlights – {chapterId.toUpperCase()}</Title>
      <Paragraph>Catch up on top moments and milestones for {chapterId}.</Paragraph>
    </div>
  );
};

export default HighlightsPage;
