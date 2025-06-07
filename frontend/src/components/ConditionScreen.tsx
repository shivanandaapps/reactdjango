import React, { useState, useEffect, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Stack,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import SettingsIcon from '@mui/icons-material/Settings';

const MotionPaper = motion(Paper);

const ConditionScreen = (): ReactElement => {
  const navigate = useNavigate();
  const [processAll, setProcessAll] = useState<boolean>(true);
  const [startRow, setStartRow] = useState<string>('');
  const [endRow, setEndRow] = useState<string>('');

  // Load saved processing options on component mount
  useEffect(() => {
    const savedProcessAll = localStorage.getItem('processAll');
    const savedStartRow = localStorage.getItem('startRow');
    const savedEndRow = localStorage.getItem('endRow');
    
    if (savedProcessAll !== null) {
      setProcessAll(savedProcessAll === 'true');
    }
    
    if (savedStartRow) {
      setStartRow(savedStartRow);
    }

    if (savedEndRow) {
      setEndRow(savedEndRow);
    }

    // Validate that we have required data from previous step
    const templateId = localStorage.getItem('templateId');
    const dataFileId = localStorage.getItem('dataFileId');
    
    if (!templateId || !dataFileId) {
      navigate('/');
    }
  }, [navigate]);

  const handleBack = () => {
    // Save current state before navigating
    localStorage.setItem('processAll', processAll.toString());
    if (startRow) localStorage.setItem('startRow', startRow);
    if (endRow) localStorage.setItem('endRow', endRow);
    navigate('/');
  };

  const handleContinue = () => {
    // Save current state before navigating
    localStorage.setItem('processAll', processAll.toString());
    if (startRow) localStorage.setItem('startRow', startRow);
    if (endRow) localStorage.setItem('endRow', endRow);
    navigate('/task');
  };

  const isValidRange = () => {
    if (processAll) return true;
    const start = parseInt(startRow);
    const end = parseInt(endRow);
    return !isNaN(start) && !isNaN(end) && start > 0 && end >= start;
  };

  return (
    <Container maxWidth="md">
      <MotionPaper
        elevation={0}
        sx={{ p: 4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack spacing={4}>
          <Box sx={{ textAlign: 'center' }}>
            <SettingsIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2
              }} 
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Processing Options
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Configure which rows from your data file should be processed
            </Typography>
          </Box>

          <Box sx={{
            bgcolor: alpha('#2563eb', 0.04),
            p: 3,
            borderRadius: 2,
          }}>
            <FormControl component="fieldset">
              <RadioGroup
                value={processAll}
                onChange={(e) => setProcessAll(e.target.value === 'true')}
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label={
                    <Typography variant="body1" fontWeight={500}>
                      Process all rows
                    </Typography>
                  }
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label={
                    <Typography variant="body1" fontWeight={500}>
                      Select row range
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            {!processAll && (
              <Box sx={{ mt: 2, ml: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    type="number"
                    label="Start Row"
                    value={startRow}
                    onChange={(e) => setStartRow(e.target.value)}
                    size="small"
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    sx={{
                      width: '150px',
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
                  <Typography variant="body1">to</Typography>
                  <TextField
                    type="number"
                    label="End Row"
                    value={endRow}
                    onChange={(e) => setEndRow(e.target.value)}
                    size="small"
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    sx={{
                      width: '150px',
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
                </Stack>
                {!isValidRange() && !processAll && (startRow || endRow) && (
                  <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1, ml: 1 }}>
                    Please enter a valid row range (End Row must be greater than or equal to Start Row)
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handleBack}
              size="large"
              sx={{ px: 4 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              size="large"
              sx={{ px: 4 }}
              disabled={!processAll && !isValidRange()}
            >
              Continue
            </Button>
          </Stack>
        </Stack>
      </MotionPaper>
    </Container>
  );
};

export default ConditionScreen;
