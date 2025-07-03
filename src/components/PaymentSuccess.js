import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const PaymentSuccess = () => {
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const amount = query.get('amount');
    const mentorId = query.get('custom_str1');

    if (amount && mentorId) {
      const savePayment = async () => {
        try {
          await addDoc(collection(db, 'mentorDonations'), {
            mentorId,
            amount,
            status: 'Success',
            timestamp: new Date()
          });
          console.log('Payment saved successfully!');
        } catch (error) {
          console.error('Failed to save payment:', error);
        }
      };
      savePayment();
    }
  }, [location]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🎉 Payment Successful</h1>
      <p>Thanks for supporting mentorship on Skillify!</p>
    </div>
  );
};

export default PaymentSuccess;
