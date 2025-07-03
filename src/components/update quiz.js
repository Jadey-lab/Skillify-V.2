import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getCountFromServer,
  runTransaction,
  doc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import {
  Card,
  List,
  Typography,
  Avatar,
  Pagination,
  Spin,
  notification,
  Button,
  Modal,
  Input,
  Segmented,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Leaderboard = () => {
  const pageSize = 10;
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  // Leaderboard states
  const [players, setPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mode: 'global' or 'friends'
  const [mode, setMode] = useState("global");

  // Pagination caching
  const pageCache = useRef({});
  const lastDocs = useRef([]);

  // Track previous page players for animations & notifications
  const prevPagePlayersRef = useRef([]);

  // Friend system states
  const [friends, setFriends] = useState(new Set());
  const [incomingReqs, setIncomingReqs] = useState(new Set());
  const [outgoingReqs, setOutgoingReqs] = useState(new Set());

  // XP donation modal
  const [donateModal, setDonateModal] = useState({ open: false, friend: null });
  const [donateAmount, setDonateAmount] = useState(10);

  // Fetch total user count
  useEffect(() => {
    (async () => {
      const snap = await getCountFromServer(collection(db, "users"));
      setTotalPlayers(snap.data().count);
    })();
  }, []);

  // Listen to friend requests and friends
  useEffect(() => {
    if (!currentUserId) return;
    const reqsRef = collection(db, `users/${currentUserId}/friendRequests`);
    const friendsRef = collection(db, `users/${currentUserId}/friends`);

    const unsubReqs = onSnapshot(reqsRef, (snap) => {
      const inc = new Set();
      const out = new Set();
      snap.docs.forEach((d) => {
        const { from, to, status } = d.data();
        if (to === currentUserId && status === "pending") inc.add(from);
        if (from === currentUserId && status === "pending") out.add(to);
      });
      setIncomingReqs(inc);
      setOutgoingReqs(out);
    });

    const unsubFriends = onSnapshot(friendsRef, (snap) => {
      const fset = new Set(snap.docs.map((d) => d.id));
      setFriends(fset);
    });

    return () => { unsubReqs(); unsubFriends(); };
  }, [currentUserId]);

  // Show overtake notification
  const showOvertakeNotification = (oldList, newList) => {
    oldList.forEach((oldPlayer, oldIndex) => {
      const newIndex = newList.findIndex((p) => p.id === oldPlayer.id);
      if (newIndex !== -1 && newIndex < oldIndex) {
        const overtaken = newList.slice(newIndex + 1, oldIndex)
          .map(p => p.firstName || "Anonymous");
        if (overtaken.length > 0) {
          notification.open({
            message: `${oldPlayer.firstName || "Anonymous"} just overtook ${overtaken.join(", ")}`,
            description: `${oldPlayer.highestScore} XP`,
            duration: 4,
          });
        }
      }
    });
  };

  // Fetch page with real-time updates
  const fetchPage = (page = 1) => {
    setLoading(true);
    if (pageCache.current[page]) {
      setPlayers(pageCache.current[page]);
      setCurrentPage(page);
      setLoading(false);
      return;
    }

    let baseQuery = query(
      collection(db, "users"),
      orderBy("highestScore", "desc"),
      limit(pageSize)
    );
    if (page > 1) {
      const prevDoc = lastDocs.current[page - 2];
      if (prevDoc) {
        baseQuery = query(
          collection(db, "users"),
          orderBy("highestScore", "desc"),
          startAfter(prevDoc),
          limit(pageSize)
        );
      }
    }

    const unsub = onSnapshot(baseQuery, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (snap.docs.length) {
        lastDocs.current[page - 1] = snap.docs[snap.docs.length - 1];
      }
      if (pageCache.current[page]) {
        showOvertakeNotification(pageCache.current[page], list);
      }
      prevPagePlayersRef.current = pageCache.current[page] || [];
      pageCache.current[page] = list;

      setPlayers(list);
      setCurrentPage(page);
      setLoading(false);
    });

    return () => unsub();
  };

  // Initial load
  useEffect(() => {
    fetchPage(1);
  }, []);

  const handlePageChange = (page) => fetchPage(page);

  // Handle friend request
  const sendFriendRequest = async (friendId) => {
    await runTransaction(db, async (tx) => {
      const reqRef = doc(db, `users/${friendId}/friendRequests`, currentUserId);
      tx.set(reqRef, { from: currentUserId, to: friendId, status: "pending", timestamp: Date.now() });
    });
    notification.success({ message: "Friend request sent!" });
  };

  const acceptFriend = async (fromId) => {
    // move to friends
    const userRef = doc(db, `users/${currentUserId}/friends`, fromId);
    const otherRef = doc(db, `users/${fromId}/friends`, currentUserId);
    const reqRef = doc(db, `users/${currentUserId}/friendRequests`, fromId);
    await runTransaction(db, async (tx) => {
      tx.set(userRef, { since: Date.now() });
      tx.set(otherRef, { since: Date.now() });
      tx.delete(reqRef);
    });
    notification.success({ message: "Friend request accepted!" });
  };

  // Handle XP donation
  const handleDonate = async () => {
    const friendId = donateModal.friend.id;
    await runTransaction(db, async (tx) => {
      const userRef = doc(db, "users", currentUserId);
      const friendRef = doc(db, "users", friendId);
      const userSnap = await tx.get(userRef);
      const frSnap = await tx.get(friendRef);
      const uXP = userSnap.data().highestScore || 0;
      const fXP = frSnap.data().highestScore || 0;
      if (uXP >= donateAmount) {
        tx.update(userRef, { highestScore: uXP - donateAmount });
        tx.update(friendRef, { highestScore: fXP + donateAmount });
        notification.success({ message: `Donated ${donateAmount} XP to ${donateModal.friend.firstName || 'Anonymous'}` });
      } else {
        notification.warning({ message: "Insufficient XP" });
      }
    });
    setDonateModal({ open: false, friend: null });
  };

  return (
    <Card
      title={<Title level={3}>Top {currentPage * pageSize} Players</Title>}
      extra={
        <Segmented
          options={["global", "friends"]}
          value={mode}
          onChange={setMode}
        />
      }
      style={{ width: "100%", maxWidth: 500, margin: "20px auto" }}
    >
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
      ) : (
        <>
          <AnimatePresence>
            <List
              dataSource={
                mode === "friends"
                  ? players.filter(p => friends.has(p.id))
                  : players
              }
              renderItem={(player, idx) => {
                const globalRank = (currentPage - 1) * pageSize + idx + 1;
                const prevPlayers = prevPagePlayersRef.current;
                const prevIdx = prevPlayers.findIndex(p => p.id === player.id);
                const prevRank = prevIdx > -1 ? (currentPage-1)*pageSize + prevIdx +1 : globalRank;
                let icon = null;
                if (prevRank > globalRank) icon = <ArrowUpOutlined style={{ color: 'green' }}/>
                else if (prevRank < globalRank) icon = <ArrowDownOutlined style={{ color: 'red' }}/>
                else icon = <MinusOutlined style={{ color: '#aaa' }}/>

                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <List.Item
                      actions={[
                        friends.has(player.id)
                          ? <Button onClick={() => setDonateModal({ open: true, friend: player })}>Donate XP</Button>
                          : mode === 'global' && player.id !== currentUserId && !incomingReqs.has(player.id) && !outgoingReqs.has(player.id)
                          ? <Button onClick={() => sendFriendRequest(player.id)}>Add Friend</Button>
                          : mode === 'global' && incomingReqs.has(player.id)
                          ? <Button onClick={() => acceptFriend(player.id)}>Accept</Button>
                          : <Text type="secondary">{ outgoingReqs.has(player.id) ? 'Pending' : '' }</Text>
                      ]}
                      style={
                        globalRank === 10
                          ? { backgroundColor: "#f5f5f5", borderRadius: 8 }
                          : {}
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={player.profileImage || 'https://www.svgrepo.com/show/470668/person-front-view.svg'} />}
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Text strong style={ globalRank<=3 ? { color: globalRank===1?'gold':globalRank===2?'silver':'peru' }:{} }>
                              {globalRank}. {player.firstName || 'Anonymous'}
                            </Text>
                            {icon}
                          </div>
                        }
                        description={<Text>{player.highestScore} XP</Text>}
                      />
                    </List.Item>
                  </motion.div>
                );
              }}
            />
          </AnimatePresence>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalPlayers}
            onChange={handlePageChange}
            style={{ textAlign: 'center', marginTop: 20 }}
          />
        </>
      )}

      <Modal
        title={`Donate XP to ${donateModal.friend?.firstName || 'Friend'}`}
        open={donateModal.open}
        onOk={handleDonate}
        onCancel={() => setDonateModal({ open: false, friend: null })}
      >
        <Input
          type="number"
          min={1}
          value={donateAmount}
          onChange={e => setDonateAmount(Number(e.target.value))}
          addonAfter="XP"
        />
      </Modal>
    </Card>
  );
};

export default Leaderboard;
