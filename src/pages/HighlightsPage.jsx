import React, { useState } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Button,
  Space,
  List,
  Grid,
  message,
  Input,
} from 'antd';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';

import { motion, AnimatePresence } from 'framer-motion';

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const chapterData = {
  nwu: {
    name: 'NWU SAS',
    posts: [
      {
        id: '1',
        title: 'SAS Research Showcase',
        author: 'Prof. Malebo',
        date: '2025-06-20',
        categories: ['Research', 'NWU'],
        summary:
          'Discover the latest groundbreaking studies from our NWU SAS researchers across multiple scientific disciplines.',
        coverImage:
          'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=10',
        likes: 14,
        comments: [
          {
            name: 'Jessica Styn',
            avatar: 'https://i.pravatar.cc/40?img=15',
            text: 'Very insightful!',
          },
          {
            name: 'Jano van Vuuran',
            avatar: 'https://i.pravatar.cc/40?img=14',
            text: "Excited for what's next.",
          },
        ],
      },
      {
        id: '2',
        title: 'STEM Fair Recap',
        author: 'Dr. Masego',
        date: '2025-06-21',
        categories: ['STEM', 'Events'],
        summary:
          'A full recap of the annual NWU STEM Fair showcasing student innovations and research projects.',
        coverImage:
          'https://images.pexels.com/photos/2566581/pexels-photo-2566581.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=11',
        likes: 22,
        comments: [
          {
            name: 'Neo',
            avatar: 'https://i.pravatar.cc/40?img=21',
            text: 'Great student work on display!',
          },
        ],
      },
      {
        id: '3',
        title: 'AI in Biological Research',
        author: 'Dr. Neo T.',
        date: '2025-06-23',
        categories: ['AI', 'Biotech'],
        summary:
          'Exploring how artificial intelligence is revolutionizing biological data analysis at NWU.',
        coverImage:
          'https://images.pexels.com/photos/5863396/pexels-photo-5863396.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=12',
        likes: 15,
        comments: [
          {
            name: 'Jessica Styn',
            avatar: 'https://i.pravatar.cc/40?img=15',
            text: 'Very insightful!',
          },
          {
            name: 'Jano van Vuuran',
            avatar: 'https://i.pravatar.cc/40?img=14',
            text: "Excited for what's next.",
          },
        ],
      },
      {
        id: '4',
        title: 'NWU Science Career Day Recap',
        author: 'Ms. Dineo',
        date: '2025-06-24',
        categories: ['Career', 'Outreach'],
        summary:
          'Students explored careers in science with industry professionals at the NWU SAS Career Day.',
        coverImage:
          'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=13',
        likes: 17,
        comments: [
          {
            name: 'Sibongile',
            avatar: 'https://i.pravatar.cc/40?img=17',
            text: 'Great opportunity for networking.',
          },
          {
            name: 'Khan',
            avatar: 'https://i.pravatar.cc/40?img=18',
            text: 'Loved meeting the professionals!',
          },
        ],
      },
    ],
  },
  lesotho: {
    name: 'International - Lesotho',
    posts: [
      {
        id: '1',
        title: 'Lesotho Climate Innovation Drive',
        author: 'Mpho Ralebese',
        date: '2025-06-18',
        categories: ['Environment', 'Innovation'],
        summary:
          'Youth in Lesotho are developing climate-smart agricultural solutions to improve sustainability.',
        coverImage:
          'https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=20',
        likes: 10,
        comments: [
          {
            name: 'Mei ',
            avatar: 'https://i.pravatar.cc/40?img=25',
            text: 'Such a creative event!',
          },
          {
            name: 'Greta Tunbery',
            avatar: 'https://i.pravatar.cc/40?img=26',
            text: 'Hope this becomes annual.',
          },
        ],
      },
      {
        id: '2',
        title: 'Women in Science – Lesotho',
        author: 'Tebello M.',
        date: '2025-06-19',
        categories: ['Inspiration', 'Women in STEM'],
        summary:
          'Highlighting trailblazing women scientists in Lesotho and their impact on local research.',
        coverImage:
          'https://images.pexels.com/photos/4031517/pexels-photo-4031517.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=27',
        likes: 13,
        comments: [
          {
            name: 'Anika de Wit',
            avatar: 'https://i.pravatar.cc/40?img=28',
            text: 'Powerful stories!',
          },
        ],
      },
      {
        id: '3',
        title: 'Lesotho Science Expo Recap',
        author: 'Tumo Lekhotla',
        date: '2025-06-20',
        categories: ['Expo', 'Education'],
        summary:
          'A look back at the annual science expo held in Maseru, showcasing brilliant student projects.',
        coverImage:
          'https://images.pexels.com/photos/1181338/pexels-photo-1181338.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=29',
        likes: 16,
        comments: [
          {
            name: 'Johanna Oosthuizen',
            avatar: 'https://i.pravatar.cc/40?img=31',
            text: 'Awesome event!',
          },
        ],
      },
      {
        id: '4',
        title: 'Tech Bootcamp in Maseru',
        author: 'Ms. Lineo',
        date: '2025-06-22',
        categories: ['Tech', 'Training'],
        summary:
          'Participants learned programming and robotics during the first Maseru Tech Bootcamp.',
        coverImage:
          'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=32',
        likes: 11,
        comments: [
          {
            name: 'Mokoena',
            avatar: 'https://i.pravatar.cc/40?img=35',
            text: 'Wish I attended!',
          },
        ],
      },
    ],
  },
  kenya: {
    name: 'International - Kenya',
    posts: [
      {
        id: '1',
        title: 'Kenya Green Energy Project Launch',
        author: 'Dr. Kibet',
        date: '2025-06-16',
        categories: ['Energy', 'Africa'],
        summary:
          'A new partnership empowers rural communities with off-grid solar installations across Kenya.',
        coverImage:
          'https://images.pexels.com/photos/4051075/pexels-photo-4051075.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=30',
        likes: 19,
        comments: [
          {
            name: 'Brian',
            avatar: 'https://i.pravatar.cc/40?img=33',
            text: 'This is inspiring!',
          },
          {
            name: 'Esther',
            avatar: 'https://i.pravatar.cc/40?img=34',
            text: 'Kenya is on the map!',
          },
        ],
      },
      {
        id: '2',
        title: 'STEM Youth Empowerment Kenya',
        author: 'Naomi W.',
        date: '2025-06-18',
        categories: ['Youth', 'STEM'],
        summary:
          'Kenya hosts STEM youth training to build interest in science and innovation careers.',
        coverImage:
          'https://images.pexels.com/photos/3810792/pexels-photo-3810792.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=36',
        likes: 18,
        comments: [
          {
            name: 'Kiana',
            avatar: 'https://i.pravatar.cc/40?img=37',
            text: 'Great program for young minds.',
          },
        ],
      },
      {
        id: '3',
        title: 'Kenyan Students Visit CERN',
        author: 'Dr. Achieng',
        date: '2025-06-19',
        categories: ['Physics', 'Travel'],
        summary:
          'A group of Kenyan students visit CERN, learning about particle accelerators and international science.',
        coverImage:
          'https://images.pexels.com/photos/5863310/pexels-photo-5863310.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=38',
        likes: 23,
        comments: [
          {
            name: 'Faith',
            avatar: 'https://i.pravatar.cc/40?img=39',
            text: 'Such an exciting opportunity!',
          },
        ],
      },
      {
        id: '4',
        title: 'Kenya AI & Robotics Conference',
        author: 'Eng. Muriithi',
        date: '2025-06-21',
        categories: ['Robotics', 'Conference'],
        summary:
          "Experts gathered in Nairobi to discuss AI and robotics in Africa's development.",
        coverImage:
          'https://images.pexels.com/photos/19233057/pexels-photo-19233057.jpeg',
        avatarUrl: 'https://i.pravatar.cc/40?img=40',
        likes: 20,
        comments: [
          {
            name: 'Lucy',
            avatar: 'https://i.pravatar.cc/40?img=41',
            text: 'So informative and futuristic!',
          },
        ],
      },
    ],
  },
};

const ChapterTabsGrid = () => {
  const { chapterId } = useParams();
  const screens = useBreakpoint();
  const chapter = chapterData[chapterId] || { name: 'Unknown Chapter', posts: [] };
  const [commentsVisible, setCommentsVisible] = useState({});
  const [activePostId, setActivePostId] = useState(null);

  const toggleComments = (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setCommentsVisible({});
    } else {
      setActivePostId(postId);
      setCommentsVisible({ [postId]: true });
    }
  };

  const handleLike = () => {
    message.info('Feature coming soon!');
  };

  const handleCommentSubmit = () => {
    message.info('Feature coming soon!');
  };

  return (
    <div style={{ padding: '40px 20px', background: '#fafafa', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Text type="secondary" style={{ fontSize: screens.md ? 18 : 16 }}>
            {chapter.name}
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {chapter.posts.map((post) => {
            const isActive = activePostId === post.id;
            const isOtherActive = activePostId && activePostId !== post.id;

            return (
              <Col
                key={post.id}
                xs={24}
                sm={12}
                md={12}
                lg={8}
                xl={6}
                style={{ display: 'flex' }}
              >
                <motion.div
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{
                    opacity: isActive ? 1 : isOtherActive ? 0.6 : 1,
                    scale: isActive ? 1.02 : isOtherActive ? 0.95 : 1,
                    boxShadow: isActive
                      ? '0 8px 20px rgba(0,0,0,0.15)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: { type: 'spring', stiffness: 300, damping: 30 },
                  }}
                  style={{ width: '100%', borderRadius: 12, display: 'flex', flexDirection: 'column' }}
                >
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={post.title}
                        src={post.coverImage}
                        style={{
                          borderTopLeftRadius: 6,
                          borderTopRightRadius: 6,
                          height: 160,
                          objectFit: 'cover',
                        }}
                      />
                    }
                    style={{
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                    bodyStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <Space align="center" size="middle" style={{ marginBottom: 8 }}>
                      <Avatar src={post.avatarUrl} />
                      <Text strong>{post.title}</Text>
                    </Space>

                    <Paragraph type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                      {new Date(post.date).toLocaleDateString()} — By {post.author}
                    </Paragraph>

                    <div style={{ marginBottom: 12 }}>
                      {post.categories.map((c) => (
                        <Tag key={c} color="blue">
                          {c}
                        </Tag>
                      ))}
                    </div>

                    <Paragraph ellipsis={{ rows: 3 }} style={{ flexGrow: 1 }}>
                      {post.summary}
                    </Paragraph>

                    <div style={{ marginTop: 'auto' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Button size="small" type="primary" onClick={handleLike}>
                            Like ({post.likes})
                          </Button>
                          <Button size="small" onClick={() => toggleComments(post.id)}>
                            💬 Comments ({post.comments.length})
                          </Button>
                        </Space>

                        <AnimatePresence initial={false}>
                          {commentsVisible[post.id] && (
                            <motion.div
                              key="comments"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <List
                                size="small"
                                dataSource={post.comments}
                                renderItem={(comment, idx) => (
                                  <List.Item key={idx}>
                                    <List.Item.Meta
                                      avatar={<Avatar src={comment.avatar} />}
                                      title={comment.name}
                                      description={comment.text}
                                    />
                                  </List.Item>
                                )}
                                style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto' }}
                              />
                              <Input.Group compact style={{ marginTop: 8 }}>
                                <Input
                                  style={{ width: 'calc(100% - 110px)' }}
                                  placeholder="Add a comment..."
                                  disabled
                                />
                                <Button type="primary" onClick={handleCommentSubmit} disabled>
                                  Submit
                                </Button>
                              </Input.Group>
                              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                                Comment feature coming soon!
                              </Text>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Space>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      </div>

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

export default ChapterTabsGrid;
