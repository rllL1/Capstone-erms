'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: student, error } = await supabase
            .from('students')
            .select('fullname')
            .eq('user_id', session.user.id)
            .single();

          if (!error && student && mounted) {
            setName(student.fullname || null);
          }
        }
      } catch (err) {
        console.error('Dashboard session check failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <main className="p-6">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Student Dashboard
        </Typography>
        {name && (
          <Typography variant="body1">Welcome, {name}</Typography>
        )}
      </Box>
    </main>
  );
}