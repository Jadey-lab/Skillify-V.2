import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { jsPDF } from 'jspdf'; // For generating PDF certificate

const DigitalCertificate = ({ eventTitle, userName }) => {
  const [certificateVisible, setCertificateVisible] = useState(false);

  // Function to generate PDF certificate
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add certificate title
    doc.setFontSize(22);
    doc.text('Certificate of Attendance', 105, 30, null, null, 'center');
    
    // Add event title and user name
    doc.setFontSize(16);
    doc.text(`This is to certify that`, 105, 50, null, null, 'center');
    doc.text(userName, 105, 60, null, null, 'center');
    doc.text(`has successfully attended the event`, 105, 70, null, null, 'center');
    doc.text(eventTitle, 105, 80, null, null, 'center');
    
    // Save PDF
    doc.save(`${eventTitle}_Certificate.pdf`);
  };

  return (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      {certificateVisible ? (
        <Paper sx={{ padding: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>Digital Certificate</Typography>
          <Typography variant="h6" sx={{ fontWeight: 400 }}>
            <strong>Event:</strong> {eventTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Participant:</strong> {userName}
          </Typography>
          <Button variant="contained" color="primary" onClick={generatePDF}>
            Download Certificate
          </Button>
        </Paper>
      ) : (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setCertificateVisible(true)}
        >
          View Certificate
        </Button>
      )}
    </Box>
  );
};

export default DigitalCertificate;
