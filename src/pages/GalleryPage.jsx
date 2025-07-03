import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Modal, Button, Grid, Tooltip, message } from 'antd';
import { LikeOutlined, LikeFilled } from '@ant-design/icons';
import BackButton from '../components/BackButton';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, setDoc, increment } from 'firebase/firestore';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const chapters = [
  { id: 'nwu', name: 'NWU SAS' },
  { id: 'lesotho', name: 'International - Lesotho' },
  { id: 'kenya', name: 'International - Kenya' },
];

const imagesByChapter = {
  kenya: [
    {
      url: 'https://images.pexels.com/photos/5905957/pexels-photo-5905957.jpeg',
      caption: 'Meet mathew and his teach Kanola #science is fun',
    },
    {
      url: 'https://images.pexels.com/photos/414519/pexels-photo-414519.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      caption: 'Sunrise in the heart of Kenya',
    },
    {
      url: 'https://images.pexels.com/photos/5965928/pexels-photo-5965928.jpeg',
      caption: 'Technology helping students ace their exams!',
    },
  ],
  lesotho: [
    {
      url: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg',
      caption: 'Students interacting',
    },
    {
      url: 'https://images.pexels.com/photos/3735710/pexels-photo-3735710.jpeg',
      caption: 'Science is so interesting, look at that!',
    },
  ],
  nwu: [
    {
      url: 'https://images.pexels.com/photos/1181296/pexels-photo-1181296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      caption: 'POV: When your brain decides to understand everything right before the exam 😆📚',
    },
    {
      url: 'https://images.pexels.com/photos/3825443/pexels-photo-3825443.jpeg',
      caption: '#IloveChemistry',
    },
  ],
};

const ChapterTabsGrid = () => {
  const { chapterId } = useParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [likesCount, setLikesCount] = useState(0);

  const normalizedChapterId = (chapterId || '').toLowerCase();
  const chapterExists = chapters.some(c => c.id === normalizedChapterId);
  const currentChapterId = chapterExists ? normalizedChapterId : chapters[0].id;
  const images = imagesByChapter[currentChapterId] || [];
  const chapterName = chapters.find(c => c.id === currentChapterId)?.name || 'Unknown Chapter';

  // Demo Like Tracker (single doc)
  const demoLikeDocRef = doc(db, 'galleryDemoLikes', 'demoImageLikes');

  useEffect(() => {
    const unsub = onSnapshot(demoLikeDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setLikesCount(docSnap.data().likesCount || 0);
      } else {
        setDoc(demoLikeDocRef, { likesCount: 0 }).catch(console.error);
        setLikesCount(0);
      }
    });

    return () => unsub();
  }, []);

  const openPreview = (img) => {
    setPreviewImage(img);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewImage(null);
  };

  const handleLike = async () => {
    try {
      await updateDoc(demoLikeDocRef, {
        likesCount: increment(1),
      });
      message.success('Liked!');
    } catch (err) {
      await setDoc(demoLikeDocRef, { likesCount: 1 });
      message.success('Liked!');
    }
  };

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Disclaimer */}
      <Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
        Demo mode: Feature coming soon — likes will be linked to user accounts.
      </Text>

      <Title level={4} style={{ textAlign: 'center', marginBottom: 24, fontWeight: 300 }}>
        Welcome to the {chapterName}
      </Title>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          maxWidth: 1024,
          width: '100%',
        }}
      >
        {images.map(({ url, caption }, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
          >
            <img
              src={url}
              alt={caption}
              loading="lazy"
              style={{
                width: '100%',
                objectFit: 'cover',
                aspectRatio: '4 / 3',
              }}
              onClick={() => openPreview(url)}
            />

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                color: '#fff',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{caption}</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tooltip title="Like">
                  <Button
                    type="text"
                    icon={<LikeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike();
                    }}
                    style={{ color: '#fff', fontSize: 16 }}
                  />
                </Tooltip>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{likesCount}</span>
              </div>
            </div>
          </div>
        ))}
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

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={closePreview}
        centered
        width={isMobile ? '90vw' : 800}
        bodyStyle={{ padding: 0, textAlign: 'center' }}
        destroyOnClose
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            style={{ width: '100%', height: 'auto' }}
            draggable={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default ChapterTabsGrid;
