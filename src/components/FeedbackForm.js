import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  MenuItem 
} from '@mui/material';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const FeedbackForm = ({ eventId, uid }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const feedbackData = {
        eventId,
        uid,
        rating,
        comment,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, 'feedback'), feedbackData);
      setRating('');
      setComment('');
      alert('Feedback submitted!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ mt: 1, border: '1px solid #ccc', p: 2, borderRadius: '4px' }}
    >
      <TextField
        select
        label="Rating"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        fullWidth
        required
        sx={{ mb: 1 }}
      >
        <MenuItem value="1">1 - Poor</MenuItem>
        <MenuItem value="2">2 - Fair</MenuItem>
        <MenuItem value="3">3 - Good</MenuItem>
        <MenuItem value="4">4 - Very Good</MenuItem>
        <MenuItem value="5">5 - Excellent</MenuItem>
      </TextField>
      <TextField
        label="Comments"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        multiline
        rows={3}
        fullWidth
        required
        sx={{ mb: 1 }}
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </Box>
  );
};

export default FeedbackForm;
