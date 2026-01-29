import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function StudentGradesPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Grades</Typography>
      <Typography>Final grades per subject (read-only) will appear here.</Typography>
    </Box>
  );
}
