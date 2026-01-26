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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ExamGradesTab() {
  const [examGrades, setExamGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    exam_name: '',
    score: '',
    max_score: '100',
    remarks: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchExamGrades();
  }, []);

  const fetchStudents = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, student_id, fullname')
      .eq('role', 'student')
      .eq('status', 'active')
      .order('fullname');
    
    if (data) setStudents(data);
  };

  const fetchExamGrades = async () => {
    // TODO: Implement when exam_grades table is created
    setExamGrades([]);
  };

  const handleOpenDialog = (grade: any = null) => {
    if (grade) {
      setSelectedGrade(grade);
      setFormData({
        student_id: grade.student_id,
        exam_name: grade.exam_name,
        score: grade.score.toString(),
        max_score: grade.max_score.toString(),
        remarks: grade.remarks || '',
      });
    } else {
      setSelectedGrade(null);
      setFormData({
        student_id: '',
        exam_name: '',
        score: '',
        max_score: '100',
        remarks: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGrade(null);
  };

  const handleSubmit = async () => {
    // TODO: Implement save functionality when exam_grades table is created
    console.log('Saving exam grade:', formData);
    handleCloseDialog();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
          Exam Score Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#8B5CF6',
            '&:hover': { bgcolor: '#7C3AED' },
          }}
        >
          Add Exam Score
        </Button>
      </Box>

      {examGrades.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 2 }}>
            No exam grades recorded yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            Click "Add Exam Score" to record student exam scores
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Exam Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Percentage</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examGrades.map((grade, index) => (
                <TableRow key={index}>
                  <TableCell>{grade.student_id}</TableCell>
                  <TableCell>{grade.student_name}</TableCell>
                  <TableCell>{grade.exam_name}</TableCell>
                  <TableCell>
                    {grade.score}/{grade.max_score}
                  </TableCell>
                  <TableCell>
                    {((grade.score / grade.max_score) * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell>{grade.remarks}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(grade)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedGrade ? 'Edit Exam Score' : 'Add Exam Score'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Student"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.student_id}>
                  {student.student_id} - {student.fullname}
                </option>
              ))}
            </TextField>

            <TextField
              label="Exam Name"
              value={formData.exam_name}
              onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
              fullWidth
              placeholder="e.g., Midterm Exam, Final Exam"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Score"
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                fullWidth
              />
              <TextField
                label="Max Score"
                type="number"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                fullWidth
              />
            </Box>

            <TextField
              label="Remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Optional remarks"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#8B5CF6',
              '&:hover': { bgcolor: '#7C3AED' },
            }}
          >
            {selectedGrade ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
