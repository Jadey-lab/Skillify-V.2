// UserProfile.js
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';  // Avatar icon

function UserProfile({ user }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        margin: '20px',
      }}
    >
      {/* Avatar with Icon */}
      <Avatar sx={{ width: 80, height: 80, marginRight: '16px' }}>
        <PersonIcon />
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight="bold">{user.displayName || 'User'}</Typography>
        <Typography variant="body2" color="textSecondary">{user.email}</Typography>
        <Typography variant="body2" color="textSecondary">{user.bio || 'No bio available'}</Typography>
      </Box>
    </Box>
  );
}

UserProfile.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
    bio: PropTypes.string,
    profilePicture: PropTypes.string,  // Optional, for image avatars
  }).isRequired,
};

export default UserProfile;
