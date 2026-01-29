"use client";

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useSnackbar } from 'notistack';

interface JoinClassModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClassPreview {
  groupId: string;
  className: string;
  teacherName: string;
  subject: string;
}

export default function JoinClassModal({ open, onClose, onSuccess }: JoinClassModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classPreview, setClassPreview] = useState<ClassPreview | null>(null);

  // Step 1: Validate and preview class
  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError('Please enter a join code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/validate-join-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid or expired code');
        return;
      }

      setClassPreview(data.classInfo);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm and join class
  const handleJoinClass = async () => {
    if (!classPreview) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to join class');
        return;
      }

      // Success - reset form and call callback
      enqueueSnackbar(`✓ Successfully joined ${classPreview.className}!`, {
        variant: 'success',
      });
      
      setCode('');
      setStep('input');
      setClassPreview(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setStep('input');
    setClassPreview(null);
    setError(null);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && code.trim()) {
      handleValidateCode();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        {step === 'input' ? 'Join a Class' : 'Confirm Class'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {step === 'input' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Ask your teacher for the join code to add this class to your dashboard.
            </Typography>

            <TextField
              label="Enter Join Code"
              placeholder="e.g., ABC123XY"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              fullWidth
              disabled={loading}
              inputProps={{
                maxLength: 10,
                style: {
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontSize: '1.1rem',
                  fontFamily: 'monospace',
                },
              }}
              autoFocus
            />

            <Typography variant="caption" sx={{ color: '#9CA3AF', textAlign: 'center' }}>
              Codes are case-insensitive and typically 8-10 characters
            </Typography>
          </Box>
        ) : classPreview ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              You&apos;re about to join:
            </Typography>

            <Card sx={{ bgcolor: '#F3E8FF', border: '2px solid #A78BFA' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {classPreview.className}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                  <strong>Subject:</strong> {classPreview.subject || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  <strong>Teacher:</strong> {classPreview.teacherName}
                </Typography>
              </CardContent>
            </Card>

            <Alert severity="info">
              After joining, you&apos;ll have access to all quizzes and assignments for this class.
            </Alert>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        {step === 'input' ? (
          <Button
            onClick={handleValidateCode}
            variant="contained"
            disabled={loading || !code.trim()}
            sx={{
              background: 'linear-gradient(to right, #8B5CF6, #6D28D9)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : null}
            Next
          </Button>
        ) : (
          <Button
            onClick={handleJoinClass}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(to right, #10B981, #059669)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : null}
            Confirm & Join
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
