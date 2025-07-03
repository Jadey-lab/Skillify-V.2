// src/components/UserRank.js
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// XP thresholds for level and badge determination
const levelThresholds = [
  { level: "Noob", xpRange: [0, 100], badge: "🥉 Bronze" },
  { level: "Semi Noob", xpRange: [101, 300], badge: "🥈 Silver" },
  { level: "Amateur", xpRange: [301, 600], badge: "🥇 Gold" },
  { level: "Pro", xpRange: [601, 2000], badge: "🏅 Platinum" },
  { level: "Master", xpRange: [2001, 5000], badge: "🏆 Diamond" },
  { level: "Grandmaster", xpRange: [5001, 10000], badge: "👑 Grandmaster" },
];

// Helper to get level and badge based on XP
const getLevelInfo = (xp) => {
  for (let entry of levelThresholds) {
    if (xp >= entry.xpRange[0] && xp <= entry.xpRange[1]) {
      return entry;
    }
  }
  return levelThresholds[0]; // default fallback
};

const UserRank = ({ userId }) => {
  const [rank, setRank] = useState(null);
  const [userData, setUserData] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("highestScore", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setTotalUsers(users.length);
      setTopUsers(users.slice(0, 3));

      const idx = users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        setRank(idx + 1);
        setUserData(users[idx]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Hide component if no firstName
  if (!userData || !userData.firstName) return null;

  const currentInfo = getLevelInfo(userData.highestScore);

  return (
    <div className="bg-blue-100 shadow-md p-4 rounded-xl w-full max-w-md mx-auto mt-4">
      <h2 className="text-xl font-semibold mb-2">Results</h2>
      <p className="text-sm">
        {userData.firstName} {userData.surname}, you are ranked <strong>#{rank}</strong> out of <strong>{totalUsers}</strong> users with <strong>{userData.highestScore} XP</strong>.
      </p>
      <p className="mt-1 text-sm">
        Level: <strong>{currentInfo.level}</strong> <span className="ml-2">{currentInfo.badge}</span>
      </p>

      <div className="mt-4">
        <h3 className="text-md font-semibold">Top 3 Users</h3>
        <ol className="list-decimal list-inside text-sm mt-1">
          {topUsers.map((user, index) => {
            const info = getLevelInfo(user.highestScore);
            const name = user.firstName ? `${user.firstName} ${user.lastName || ''}` : `User #${index + 1}`;
            return (
              <li key={user.id} className="flex justify-between">
                <span>{name}</span>
                <span>
                  {user.highestScore} XP <span className="ml-1"></span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default UserRank;
