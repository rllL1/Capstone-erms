'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import AddIcon from '@mui/icons-material/Add';
import ExamGradesTab from './ExamGradesTab';
import AssessmentGradesTab from './AssessmentGradesTab';
import ComputeGradesTab from './ComputeGradesTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`grades-tabpanel-${index}`}
      aria-labelledby={`grades-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TeacherGrades() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
        Grade Management
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Manage exam scores, assessment records, and compute final grades
      </Typography>

      <Card sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                },
                '& .Mui-selected': {
                  color: '#8B5CF6',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8B5CF6',
                },
              }}
            >
              <Tab label="Exam Grades" />
              <Tab label="Assessment Records" />
              <Tab label="Compute Grades" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <ExamGradesTab />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <AssessmentGradesTab />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ComputeGradesTab />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
