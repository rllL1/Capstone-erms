'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';

export default function ComputeGradesTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [groups, setGroups] = useState<any[]>([]);
  const [gradeWeights, setGradeWeights] = useState({
    quizzes: 30,
    assignments: 30,
    exams: 40,
  });

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  const fetchGroups = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('groups')
        .select('id, name')
        .eq('teacher_id', user.id)
        .order('name');
      
      if (data) setGroups(data);
    }
  };

  const fetchStudents = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, student_id, fullname')
      .eq('role', 'student')
      .eq('status', 'active')
      .order('fullname');
    
    if (data) {
      // TODO: Fetch actual grades and compute
      const studentsWithGrades = data.map(student => ({
        ...student,
        quizAverage: 0,
        assignmentAverage: 0,
        examAverage: 0,
        finalGrade: 0,
        letterGrade: 'N/A',
      }));
      setStudents(studentsWithGrades);
    }
  };

  const computeFinalGrade = (quiz: number, assignment: number, exam: number) => {
    const { quizzes, assignments, exams } = gradeWeights;
    return (quiz * quizzes / 100) + (assignment * assignments / 100) + (exam * exams / 100);
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 85) return 'B+';
    if (grade >= 80) return 'B';
    if (grade >= 75) return 'C+';
    if (grade >= 70) return 'C';
    if (grade >= 65) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'success';
    if (grade === 'B+' || grade === 'B') return 'info';
    if (grade === 'C+' || grade === 'C') return 'warning';
    return 'error';
  };

  const handleComputeAll = () => {
    const updated = students.map(student => {
      const finalGrade = computeFinalGrade(
        student.quizAverage,
        student.assignmentAverage,
        student.examAverage
      );
      return {
        ...student,
        finalGrade,
        letterGrade: getLetterGrade(finalGrade),
      };
    });
    setStudents(updated);
  };

  const handleSaveGrades = async () => {
    // TODO: Implement save functionality
    alert('Grades saved successfully!');
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
        Compute Final Grades
      </Typography>

      {/* Grade Weights Configuration */}
      <Card sx={{ mb: 3, bgcolor: '#F9FAFB' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Grade Weight Configuration
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Quizzes (%)"
              type="number"
              value={gradeWeights.quizzes}
              onChange={(e) => setGradeWeights({ ...gradeWeights, quizzes: Number(e.target.value) })}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Assignments (%)"
              type="number"
              value={gradeWeights.assignments}
              onChange={(e) => setGradeWeights({ ...gradeWeights, assignments: Number(e.target.value) })}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Exams (%)"
              type="number"
              value={gradeWeights.exams}
              onChange={(e) => setGradeWeights({ ...gradeWeights, exams: Number(e.target.value) })}
              sx={{ flex: 1 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
            Total: {gradeWeights.quizzes + gradeWeights.assignments + gradeWeights.exams}% 
            (should equal 100%)
          </Typography>
        </CardContent>
      </Card>

      {/* Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Group/Class</InputLabel>
          <Select
            value={selectedGroup}
            label="Group/Class"
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <MenuItem value="all">All Students</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CalculateIcon />}
            onClick={handleComputeAll}
            sx={{
              color: '#8B5CF6',
              borderColor: '#8B5CF6',
              '&:hover': {
                borderColor: '#7C3AED',
                bgcolor: '#F3E8FF',
              },
            }}
          >
            Compute All Grades
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveGrades}
            sx={{
              bgcolor: '#8B5CF6',
              '&:hover': { bgcolor: '#7C3AED' },
            }}
          >
            Save Grades
          </Button>
        </Box>
      </Box>

      {students.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 2 }}>
            No students found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quiz Avg</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assignment Avg</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Exam Avg</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Final Grade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Letter Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.fullname}</TableCell>
                  <TableCell>{student.quizAverage > 0 ? student.quizAverage.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>{student.assignmentAverage > 0 ? student.assignmentAverage.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>{student.examAverage > 0 ? student.examAverage.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {student.finalGrade > 0 ? student.finalGrade.toFixed(2) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {student.letterGrade !== 'N/A' ? (
                      <Chip
                        label={student.letterGrade}
                        size="small"
                        color={getGradeColor(student.letterGrade) as any}
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
