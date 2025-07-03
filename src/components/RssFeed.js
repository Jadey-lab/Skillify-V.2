import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Container, Paper, IconButton, Avatar } from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Ensure Firebase is properly initialized
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import AttachFileIcon from '@mui/icons-material/AttachFile';

const ChatComponent = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState({ name: "John Doe", avatar: "https://via.placeholder.com/40" }); // Placeholder contact info

  // Listen for auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch profile picture and username from Firebase Storage and Firestore
  useEffect(() => {
    if (user) {
      const storage = getStorage();
      const avatarRef = ref(storage, `profileImages/${user.uid}`); // Assuming the user's profile image is stored as <uid>.jpg

      // Fetch the profile picture
      getDownloadURL(avatarRef)
        .then((url) => {
          setContact((prevContact) => ({
            ...prevContact,
            avatar: url, // Set the fetched URL as the avatar
          }));
        })
        .catch((error) => {
          console.error("Error fetching profile image: ", error);
          setContact((prevContact) => ({
            ...prevContact,
            avatar: "https://via.placeholder.com/40", // Fallback avatar
          }));
        });

      const fetchUserName = async () => {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            // Use the first document's "firstName" and "surname" fields
            const userData = querySnapshot.docs[0].data();
            setContact((prevContact) => ({
              ...prevContact,
              name: `${userData.firstName || "User"} ${userData.surname || "Surname"}`,
            }));
          } else {
            setContact((prevContact) => ({
              ...prevContact,
              name: "User Name",
            }));
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setContact((prevContact) => ({
            ...prevContact,
            name: "User Name",
          }));
        }
      };

      fetchUserName();
    }
  }, [user]);

  // Listen for new messages in real-time once the user is authenticated
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("recipient", "==", user.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribeMessages();
  }, [user]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      // Set recipient UID to the authenticated user's UID
      await addDoc(collection(db, "messages"), {
        sender: user.uid,  // The current user as the sender
        recipient: user.uid,  // The current user as the recipient
        text: message,  // Message content
        timestamp: serverTimestamp(),  // Timestamp of the message
      });

      setMessage(""); // Clear the message input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Show a prompt if the user is not authenticated
  if (!user) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: 'gray' }}>Please sign in to view your messages.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ paddingBottom: 5 }}>
      <Paper elevation={5} sx={{ padding: 3, marginTop: 5, borderRadius: 2, backgroundColor: '#f8f8f8' }}>
        {/* Header with contact name and avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <Avatar src={contact.avatar} sx={{ marginRight: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{contact.name}</Typography>
        </Box>

        {/* Messages area */}
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 2,
            borderRadius: 6,
            maxHeight: '400px',
            overflowY: 'auto',
            marginBottom: 2,
          }}
        >
          {messages.length > 0 ? (
            messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: msg.sender === user.uid ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  marginBottom: 2,
                }}
              >
                {/* Message Bubble */}
                <Box
                  sx={{
                    padding: '10px 15px',
                    backgroundColor: msg.sender === user.uid ? 'black' : '#ece5dd',
                    color: msg.sender === user.uid ? 'white' : 'black',
                    borderRadius: '20px',
                    maxWidth: '75%',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                  {/* Message Timestamp */}
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', marginTop: '5px', color: 'white' }}>
                    {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: 'gray' }}>No messages for you yet.</Typography>
          )}
        </Box>

        {/* Input area with an attachment icon and a send button */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="primary">
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            label="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              marginBottom: 2,
              backgroundColor: '#fff',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: '8px',
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{
              backgroundColor: 'white',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              minWidth: '48px',
              marginLeft: 1,
              '&:hover': {
                backgroundColor: '#silver',
              },
            }}
          >
            <Typography variant="body2" sx={{ color: 'black', fontWeight: 'bold' }}>➤</Typography>
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

const ChatApp = () => {
  return (
    <Container>
      <ChatComponent />
    </Container>
  );
};

export default ChatApp;
