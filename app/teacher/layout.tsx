'use client';

import { createClient } from '@/lib/supabase/client';
import { redirect, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import Avatar from '@mui/material/Avatar';
import Link from 'next/link';
import Image from 'next/image';

const drawerWidth = 260;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
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
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
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
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
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
    width: drawerWidth,
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
            borderRight: '1px solid #E5E7EB',
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
            borderRight: '1px solid #E5E7EB',
          },
        },
      },
    ],
  }),
);

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/login');
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('fullname, role, department')
        .eq('id', user.id)
        .single();

      if (profileData?.role !== 'teacher') {
        redirect('/admin/dashboard');
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();
  }, [mounted]);

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
    { text: 'Dashboard', icon: <HomeIcon />, path: '/teacher/dashboard' },
    { text: 'Assessment', icon: <DescriptionIcon />, path: '/teacher/assessment' },
    { text: 'Examination', icon: <MenuBookIcon />, path: '/teacher/examination' },
    { text: 'Group', icon: <GroupsIcon />, path: '/teacher/group' },
  ];

  if (!mounted || loading) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[{ marginRight: 5 }, open && { display: 'none' }]}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                {profile?.fullname || 'Teacher'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                {profile?.department || 'Teacher'}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#8B5CF6' }}>
              {profile?.fullname?.charAt(0).toUpperCase() || 'T'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ bgcolor: '#FFFFFF', justifyContent: 'space-between', px: 2, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, opacity: open ? 1 : 0, transition: 'opacity 0.3s' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#111827' }}>
                ERMS
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                Teacher Portal
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
                      minHeight: 48,
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
                        minWidth: 0,
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
                minHeight: 48,
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
                  minWidth: 0,
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
