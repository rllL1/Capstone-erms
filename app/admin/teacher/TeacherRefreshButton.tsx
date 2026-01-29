'use client';

import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';

export default function TeacherRefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    // Reset after animation
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton
        aria-label="refresh"
        onClick={handleRefresh}
        disabled={isRefreshing}
        sx={{
          color: 'white',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
          transition: 'transform 0.3s ease',
          transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        <RefreshIcon />
      </IconButton>
    </Stack>
  );
}
