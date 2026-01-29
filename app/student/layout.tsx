'use client';

import { createClient } from '@/lib/supabase/client';
import { redirect, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GradeIcon from '@mui/icons-material/Grade';
import Avatar from '@mui/material/Avatar';
import Link from 'next/link';
import Image from 'next/image';

const drawerWidth = 260;

const openedMixin = (theme: Theme): CSSObject => ({
  inlineSize: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  inlineSize: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    inlineSize: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#FFFFFF',
  color: '#111827',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        insetInlineStart: drawerWidth,
        inlineSize: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    inlineSize: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': {
            ...openedMixin(theme),
            backgroundColor: '#FFFFFF',
            color: '#374151',
            borderInlineEnd: '1px solid #E5E7EB',
          },
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': {
            ...closedMixin(theme),
            backgroundColor: '#FFFFFF',
            color: '#374151',
            borderInlineEnd: '1px solid #E5E7EB',
          },
        },
      },
    ],
  }),
);

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ fullname: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just a flag to prevent rendering before mounting
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.warn('No authenticated user found');
          redirect('/login');
        }

        console.debug('Authenticated user:', user.id);

        // Check if user is a student by querying students table
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('user_id, fullname')
          .eq('user_id', user.id)
          .single();

        if (studentError || !studentData) {
          console.warn('Student record not found:', studentError);
          redirect('/login');
        }

        console.debug('Student found:', studentData.fullname);
        setProfile({ fullname: studentData.fullname, role: 'student' });
        setLoading(false);
      } catch (err: unknown) {
        console.error('Auth check error:', err);
        redirect('/login');
      }
    };

    checkAuth();
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/student/dashboard' },
    { text: 'Profile', icon: <PersonIcon />, path: '/student/profile' },
    { text: 'Class', icon: <ClassIcon />, path: '/student/class' },
    { text: 'Performance', icon: <TrendingUpIcon />, path: '/student/performance' },
    { text: 'Grades', icon: <GradeIcon />, path: '/student/grades' },
  ];

  if (loading) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f9fafb', blockSize: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[{ marginInlineEnd: 5 }, open && { display: 'none' }]}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                {profile?.fullname || 'Student'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                Student
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#8B5CF6' }}>
              {profile?.fullname?.charAt(0).toUpperCase() || 'S'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ bgcolor: '#FFFFFF', justifyContent: 'space-between', px: 2, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, opacity: open ? 1 : 0, transition: 'opacity 0.3s' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeightStep: 1.2, color: '#111827' }}>
                ERMS
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                Student Portal
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleDrawerClose} sx={{ color: '#6B7280' }}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>

        <List sx={{ px: open ? 1.5 : 0.5, py: 2, mt: 4 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <Link href={item.path} style={{ textDecoration: 'none' }}>
                <ListItemButton
                  sx={[
                    {
                      blockSize: 48,
                      borderRadius: 2,
                      color: pathname === item.path ? '#8B5CF6' : '#6B7280',
                      bgcolor: pathname === item.path ? '#F3E8FF' : 'transparent',
                      '&:hover': {
                        bgcolor: '#F9FAFB',
                        color: '#8B5CF6',
                      },
                      '& .MuiListItemIcon-root': {
                        color: pathname === item.path ? '#8B5CF6' : '#9CA3AF',
                      },
                      '&:hover .MuiListItemIcon-root': {
                        color: '#8B5CF6',
                      },
                    },
                    open
                      ? {
                          justifyContent: 'initial',
                          px: 2.5,
                        }
                      : {
                          justifyContent: 'center',
                          px: 2.5,
                        },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      {
                        inlineSize: 0,
                        justifyContent: 'center',
                      },
                      open
                        ? {
                            mr: 3,
                          }
                        : {
                            mr: 'auto',
                          },
                    ]}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: pathname === item.path ? 600 : 400 }}
                    sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: open ? 2 : 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: open ? 2 : 1, mb: 2, flexDirection: open ? 'row' : 'column' }}>
            <Image src="/2-re.png" alt="Logo 1" width={open ? 50 : 40} height={open ? 50 : 40} style={{ borderRadius: '8px' }} />
            <Image src="/234.png" alt="Logo 2" width={open ? 50 : 40} height={open ? 50 : 40} style={{ borderRadius: '8px' }} />
          </Box>

          <ListItemButton
            onClick={handleLogout}
            sx={[
              {
                blockSize: 48,
                borderRadius: 2,
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#B91C1C',
                  color: '#FFFFFF',
                  '& .MuiListItemIcon-root': {
                    color: '#FFFFFF',
                  },
                },
                '& .MuiListItemIcon-root': {
                  color: '#FFFFFF',
                },
              },
              open
                ? {
                    justifyContent: 'initial',
                    px: 2.5,
                  }
                : {
                    justifyContent: 'center',
                    px: 2.5,
                  },
            ]}
          >
            <ListItemIcon
              sx={[
                {
                  inlineSize: 0,
                  justifyContent: 'center',
                },
                open
                  ? {
                      mr: 3,
                    }
                  : {
                      mr: 'auto',
                    },
              ]}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
