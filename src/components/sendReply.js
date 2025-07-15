import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const sendReply = async ({ mentorMessageId, mentorId, user, replyText }) => {
  if (!replyText.trim()) throw new Error("Reply text cannot be empty");

  const replyData = {
    mentorMessageId,
    mentorId,
    senderId: user.uid,
    senderEmail: user.email,
    text: replyText.trim(),
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "mentorReplies"), replyData);
  console.log("Reply added with ID:", docRef.id);
  return docRef.id;
};
