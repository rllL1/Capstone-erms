'use client';

import { useRouter } from 'next/navigation';
import TeacherForm from '../TeacherForm';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CreateTeacherPage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: 3 }}>
      <Stack spacing={3} sx={{ maxWidth: 700, mx: 'auto' }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            color: '#667eea',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            width: 'fit-content',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
            },
          }}
        >
          Back to Teachers
        </Button>

        {/* Form with automatic redirect */}
        <TeacherForm isCreatePage={true} />
      </Stack>
    </Box>
  );
}
