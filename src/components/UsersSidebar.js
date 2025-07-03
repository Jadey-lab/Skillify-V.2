import React, { useState, useEffect } from "react";
import { Box, TextField, List, ListItem, ListItemAvatar, ListItemText, Avatar, Paper, Typography } from "@mui/material";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Ensure Firebase is properly initialized

const UsersSidebar = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Reference to the users collection
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  // Filter users based on search term (using firstName and surname)
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ""} ${user.surname || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Only show the first five users from the filtered results
  const displayedUsers = filteredUsers.slice(0, 5);

  return (
    <Paper elevation={3} sx={{ padding: 2, width: 300, marginRight: 2 }}>
      <Typography variant="h6" gutterBottom>
        Users
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        label="Search Users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <List>
        {displayedUsers.map(user => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Avatar src={user.avatar || "https://via.placeholder.com/40"} />
            </ListItemAvatar>
            <ListItemText primary={`${user.firstName || "User"} ${user.surname || ""}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UsersSidebar;
