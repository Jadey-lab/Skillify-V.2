// src/components/RSSFeedWidget.jsx

import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Carousel } from 'antd';
import './RSSFeedWidget.css'; // make sure this path matches your project structure

const { Text, Paragraph } = Typography;

const RSSFeedWidget = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThumbnail = async (query) => {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
          headers: {
            Authorization: 'wVfIHYpcNwD2ujAjcLjkxCk8ga5oLIqlDHAQ3rw3CrERleDci9uB7eLg',
          },
        }
      );
      const data = await response.json();
      return data.photos?.[0]?.src?.medium || null;
    } catch (err) {
      console.error('Error fetching image:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=https://www.sciencedaily.com/rss/top/science.xml`
        );
        const data = await res.json();
        if (data?.items) {
          const withImages = await Promise.all(
            data.items.slice(0, 5).map(async (item) => {
              const thumbnail = await fetchThumbnail(
                item.title.split(' ').slice(0, 3).join(' ')
              );
              return { ...item, thumbnail };
            })
          );
          setArticles(withImages);
        }
      } catch (err) {
        console.error('Failed to load RSS feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRSS();
  }, []);

  return (
    <Card
      title="Latest Science News"
      className="rss-widget-card"
      headStyle={{ fontSize: 15,  }}
    >
      {loading ? (
        <div className="rss-loading-container">
          <Spin />
        </div>
      ) : (
        <Carousel
          className="rss-carousel"
          dots
          infinite
          slidesToShow={1}
          slidesToScroll={1}
          autoplay
          autoplaySpeed={5000}
          adaptiveHeight
        >
          {articles.map((item) => (
            <div key={item.link} className="rss-slide">
              <Card
                hoverable
                cover={
                  item.thumbnail && (
                    <img
                      className="rss-carousel-thumbnail"
                      src={item.thumbnail}
                      alt="thumbnail"
                    />
                  )
                }
                bodyStyle={{ padding: 12 }}
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text strong className="rss-title">
                    {item.title}
                  </Text>
                </a>
                <div className="rss-date">
                  {new Date(item.pubDate).toLocaleDateString()}
                </div>
                <Paragraph
                  className="rss-description"
                  ellipsis={{ rows: 3 }}
                >
                  {item.description
                    .replace(/<[^>]*>?/gm, '')
                    .slice(0, 200)}
                  …
                </Paragraph>
              </Card>
            </div>
          ))}
        </Carousel>
      )}
    </Card>
  );
};

export default RSSFeedWidget;
