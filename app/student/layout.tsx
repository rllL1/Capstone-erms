"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { redirect, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return redirect('/login');
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return null;

  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
      <Box sx={{ width: 220 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Student</Typography>
        <List>
          <ListItem disablePadding>
            <Link href="/student/profile" style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemButton selected={pathname === '/student/profile'}>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </Link>
          </ListItem>
          <ListItem disablePadding>
            <Link href="/student/class" style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemButton selected={pathname === '/student/class'}>
                <ListItemText primary="Class" />
              </ListItemButton>
            </Link>
          </ListItem>
          <ListItem disablePadding>
            <Link href="/student/performance" style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemButton selected={pathname === '/student/performance'}>
                <ListItemText primary="Performance" />
              </ListItemButton>
            </Link>
          </ListItem>
          <ListItem disablePadding>
            <Link href="/student/grades" style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemButton selected={pathname === '/student/grades'}>
                <ListItemText primary="Grades" />
              </ListItemButton>
            </Link>
          </ListItem>
        </List>
      </Box>

      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}
