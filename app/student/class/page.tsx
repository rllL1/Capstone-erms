import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function StudentClassPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Class</Typography>
      <Typography>Fetching class groups and assignments will appear here.</Typography>
    </Box>
  );
}
