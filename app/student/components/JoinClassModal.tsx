'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { joinClass } from '../actions/joinClass';

interface JoinClassModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinClassModal({ open, onClose, onSuccess }: JoinClassModalProps) {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const trimmedCode = classCode.trim();
    if (!trimmedCode) {
      setError('Please enter a class code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await joinClass(trimmedCode);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setSuccess(true);
        setClassCode('');
        setLoading(false);
        
        // Wait a moment to show success message
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setClassCode('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase(); // Auto-uppercase for better UX
    setClassCode(value);
    setError(null); // Clear error on input change
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GroupAddIcon sx={{ color: '#8B5CF6', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            Join a Class
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              🎉 You've successfully joined the class!
            </Alert>
          )}

          {/* Description */}
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            Enter the class code provided by your teacher to join their class.
          </Typography>

          {/* Class Code Input */}
          <TextField
            autoFocus
            fullWidth
            label="Class Code"
            placeholder="e.g., ABC123"
            value={classCode}
            onChange={handleCodeChange}
            disabled={loading || success}
            helperText="Ask your teacher for the class code"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#8B5CF6',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#8B5CF6',
              },
            }}
          />

          {/* Example Format */}
          <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 1, border: '1px solid #E5E7EB' }}>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
              💡 Class codes are usually 6-8 characters
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Example: ABC123, MATH2024, CS101A
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleClose}
            disabled={loading}
            sx={{ 
              color: '#6B7280',
              '&:hover': {
                bgcolor: '#F3F4F6',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || success || !classCode.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{
              bgcolor: '#8B5CF6',
              '&:hover': {
                bgcolor: '#7C3AED',
              },
              '&.Mui-disabled': {
                bgcolor: '#E9D5FF',
                color: '#FFFFFF',
              },
              px: 3,
            }}
          >
            {loading ? 'Joining...' : success ? 'Joined!' : 'Join Class'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
