import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function StudentPerformancePage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Performance</Typography>
      <Typography>Quiz, assignment, and exam scores will be shown here (read-only).</Typography>
    </Box>
  );
}
