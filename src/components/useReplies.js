import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const useReplies = (mentorMessageId) => {
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    if (!mentorMessageId) return;

    const q = query(
      collection(db, "mentorReplies"),
      where("mentorMessageId", "==", mentorMessageId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReplies(items);
    });

    return () => unsubscribe();
  }, [mentorMessageId]);

  return replies;
};
