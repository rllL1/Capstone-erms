"use client";

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useSnackbar } from 'notistack';

interface GenerateJoinCodeProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onClose: () => void;
  onCodeGenerated?: (code: string) => void;
}

export default function GenerateJoinCode({
  groupId,
  groupName,
  open,
  onClose,
  onCodeGenerated,
}: GenerateJoinCodeProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState('50');
  const [expirationDays, setExpirationDays] = useState('7');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    setError(null);
    setLoading(true);

    try {
      const maxUsesNum = maxUses === '' || maxUses === '0' ? -1 : parseInt(maxUses);
      const expirationDaysNum = expirationDays === '' || expirationDays === '0' ? null : parseInt(expirationDays);

      if (!isNaN(maxUsesNum) && maxUsesNum !== -1 && maxUsesNum < 1) {
        setError('Max uses must be at least 1 or 0 for unlimited');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/teacher/generate-join-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          maxUses: maxUsesNum,
          expirationDays: expirationDaysNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate code');
        return;
      }

      setGeneratedCode(data.code);
      if (onCodeGenerated) {
        onCodeGenerated(data.code);
      }
    } catch (err) {
      console.error('Failed to generate code:', err);
      setError('An error occurred while generating the code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        enqueueSnackbar('Join code copied to clipboard!', { variant: 'success' });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        enqueueSnackbar('Failed to copy code', { variant: 'error' });
      }
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setCopied(false);
    setError(null);
    setMaxUses('50');
    setExpirationDays('7');
    onClose();
  };

  if (generatedCode) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Join Code Generated ✓</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Share this code with students in <strong>{groupName}</strong>
          </Alert>

          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2, fontWeight: 500 }}>
              Join Code:
            </Typography>
            <Box
              sx={{
                bgcolor: '#F3E8FF',
                border: '2px solid #A78BFA',
                borderRadius: '8px',
                p: 2,
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)' },
              }}
            >
              <Typography
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  fontFamily: 'monospace',
                  color: '#6D28D9',
                }}
              >
                {generatedCode}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<FileCopyIcon />}
              onClick={handleCopyCode}
              fullWidth
              sx={{
                mb: 2,
                textTransform: 'none',
                background: copied
                  ? 'linear-gradient(to right, #10B981, #059669)'
                  : 'linear-gradient(to right, #8B5CF6, #6D28D9)',
              }}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </Box>

          <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
              <strong>Max Uses:</strong> {maxUses === '' || maxUses === '0' ? 'Unlimited' : maxUses}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
              <strong>Expires:</strong>{' '}
              {expirationDays === '' || expirationDays === '0'
                ? 'Never'
                : `${expirationDays} day${expirationDays !== '1' ? 's' : ''}`}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Generate Join Code</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
          Create a unique code for students in <strong>{groupName}</strong> to join this class.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Maximum Uses
            </Typography>
            <TextField
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              fullWidth
              disabled={loading}
              inputProps={{ min: 1 }}
              helperText="Enter a number or leave blank for unlimited uses"
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Expiration (days)
            </Typography>
            <TextField
              type="number"
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              fullWidth
              disabled={loading}
              inputProps={{ min: 1 }}
              helperText="Enter a number or leave blank for no expiration"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerateCode}
          variant="contained"
          disabled={loading}
          sx={{ background: 'linear-gradient(to right, #8B5CF6, #6D28D9)' }}
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : null}
          Generate Code
        </Button>
      </DialogActions>
    </Dialog>
  );
}
