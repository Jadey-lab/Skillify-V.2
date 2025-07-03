import React, { useState, useEffect } from 'react';

const EventThumbnail = ({ title }) => {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const API_KEY = 'wVfIHYpcNwD2ujAjcLjkxCk8ga5oLIqlDHAQ3rw3CrERleDci9uB7eLg'; 
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(title)}&per_page=1`,
          {
            headers: {
              Authorization: API_KEY,
            },
          }
        );
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          setThumbnail(data.photos[0].src.medium);
        }
      } catch (error) {
        console.error('Error fetching thumbnail from Pexels:', error);
      }
    };

    fetchThumbnail();
  }, [title]);

  if (!thumbnail) return null;
  return (
    <img
      src={thumbnail}
      alt={title}
      style={{
        width: '100%',
        height: 'auto',
        marginBottom: 10,
        borderRadius: 8,
        objectFit: 'cover'
      }}
    />
  );
};

export default EventThumbnail;
