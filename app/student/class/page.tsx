'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid,
  Button,
  Chip,
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';

export default function StudentClass() {
  const [classes, setClasses] = useState<{
    name: string;
    description: string;
    studentCount: number;
    assignmentCount: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // TODO: Fetch actual classes/groups when database tables are ready
        // For now, showing placeholder
        setClasses([]);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
        My Classes
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Join classes created by your teachers and complete assignments
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Loading...
        </Typography>
      ) : classes.length === 0 ? (
        <Card sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <ClassIcon sx={{ fontSize: 80, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              No Classes Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              You haven&apos;t joined any classes yet. Contact your teacher to get class codes.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {classes.map((classItem, index) => (
            <Grid key={index} xs={12} md={6} lg={4}>
              <Card sx={{ 
                height: '100%',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
                transition: 'box-shadow 0.2s',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GroupsIcon sx={{ fontSize: 30, color: '#8B5CF6', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                      {classItem.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                    {classItem.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={`${classItem.studentCount} students`} size="small" />
                    <Chip label={`${classItem.assignmentCount} assignments`} size="small" />
                  </Box>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                      bgcolor: '#8B5CF6',
                      '&:hover': { bgcolor: '#7C3AED' },
                    }}
                  >
                    View Class
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
