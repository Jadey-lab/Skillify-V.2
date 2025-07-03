import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Card,
  List,
  Typography,
  Avatar,
  Pagination,
  Spin,
  notification,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const levelThresholds = [
  { level: "Beginner Scholar", xpRange: [0, 1000] },
  { level: "Junior Researcher", xpRange: [1001, 2000] },
  { level: "Academic Explorer", xpRange: [2001, 3500] },
  { level: "Scientific Analyst", xpRange: [3501, 5000] },
  { level: "Theorist", xpRange: [5001, 7000] },
  { level: "Senior Scientist", xpRange: [7001, 9000] },
  { level: "Principal Investigator", xpRange: [9001, 12000] },
  { level: "Distinguished Scholar", xpRange: [12001, 15000] },
  { level: "Elite Thinker", xpRange: [15001, 20000] },
  { level: "Nobel Mind", xpRange: [20001, Infinity] },
];

const getLevelFromXP = (xp) => {
  for (let i = 0; i < levelThresholds.length; i++) {
    const { level, xpRange } = levelThresholds[i];
    if (xp >= xpRange[0] && xp <= xpRange[1]) {
      return level;
    }
  }
  return "Unknown Level";
};

const medalIcons = {
  1: "https://res.cloudinary.com/db7fyg4z1/image/upload/v1749052155/gold-medal_myhpez.png",
  2: "https://res.cloudinary.com/db7fyg4z1/image/upload/v1749052155/silver-medal_e4au4p.png",
  3: "https://res.cloudinary.com/db7fyg4z1/image/upload/v1749052156/bronze-medal_1_f62itb.png",
};

const Leaderboard = () => {
  const pageSize = 10;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const prevRanksRef = useRef({});
  const prevScoresRef = useRef({});

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("highestScore", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPlayers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      newPlayers.forEach((player, index) => {
        const newRank = index + 1;
        const prevRank = prevRanksRef.current[player.id];

        if (prevRank && newRank < prevRank) {
          notification.success({
            message: "Rank Up! 🔥",
            description: `${player.firstName || "Anonymous"} moved from #${prevRank} to #${newRank}`,
            duration: 2,
          });
        }

        prevRanksRef.current[player.id] = newRank;
        prevScoresRef.current[player.id] = player.highestScore;
      });

      setPlayers(newPlayers);
      setTotalPlayers(newPlayers.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const paginatedPlayers = players.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Card
      title={<Title level={3}>Leaderboard</Title>}
      bordered={false}
      style={{ width: "100%", maxWidth: 450, margin: "0 auto", marginTop: 20 }}
    >
      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <List>
            <AnimatePresence>
              {paginatedPlayers.map((player, index) => {
                const globalRank = (currentPage - 1) * pageSize + index + 1;
                const prevRank = prevRanksRef.current[player.id];
                const prevScore = prevScoresRef.current[player.id];
                const scoreIncreased =
                  prevScore !== undefined && player.highestScore > prevScore;

                const rankChange =
                  prevRank !== undefined ? prevRank - globalRank : 0;

                const RankIcon =
                  rankChange > 0 ? (
                    <ArrowUpOutlined style={{ color: "green", marginLeft: 6 }} />
                  ) : rankChange < 0 ? (
                    <ArrowDownOutlined style={{ color: "red", marginLeft: 6 }} />
                  ) : null;

                return (
                  <motion.div
                    key={player.id}
                    layout
                    transition={{ duration: 0.5 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <Avatar
                              src={
                                player.profileImage ||
                                "https://www.svgrepo.com/show/470668/person-front-view.svg"
                              }
                              alt="Profile"
                              size={48}
                            />
                            {medalIcons[globalRank] && (
                              <img
                                src={medalIcons[globalRank]}
                                alt={`Medal rank ${globalRank}`}
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  width: 20,
                                  height: 20,
                                  borderRadius: "50%",
                                  border: "1.5px solid white",
                                  backgroundColor: "white",
                                }}
                                title={`Rank ${globalRank} Medal`}
                              />
                            )}
                          </div>
                        }
                        title={
                          <div style={{ fontWeight: "bold" }}>
                            {globalRank}. {player.firstName || "Anonymous"} {player.surname} {RankIcon}
                          </div>
                        }
                        description={
                          <>
                            <Text>{player.fieldOfStudy}</Text>
                            <br />
                            <motion.div
                              key={player.highestScore}
                              animate={
                                scoreIncreased ? { scale: [1, 1.2, 1] } : { scale: 1 }
                              }
                              transition={{ duration: 0.4 }}
                            >
                              <Text strong>{player.highestScore} XP</Text>
                              <br />
                              <Text type="secondary">
                               - {getLevelFromXP(player.highestScore)} (level)
                              </Text>
                            </motion.div>
                          </>
                        }
                      />
                    </List.Item>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </List>

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalPlayers}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: 20, textAlign: "center" }}
          />
        </>
      )}
    </Card>
  );
};

export default Leaderboard;
