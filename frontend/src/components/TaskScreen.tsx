import React, { useState, useEffect, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  SelectChangeEvent,
  alpha,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import SyncIcon from '@mui/icons-material/Sync';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import * as api from '../services/api';

interface Mapping {
  [key: string]: string;
}

const MotionPaper = motion(Paper);

const TaskScreen = (): ReactElement => {
  const navigate = useNavigate();
  const [outputFormat, setOutputFormat] = useState<string>('docx');
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filenamePattern, setFilenamePattern] = useState<string>('document_{{id}}');
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string>('');

  useEffect(() => {
    // Load saved format, mapping and filename pattern
    const savedFormat = localStorage.getItem('outputFormat');
    const savedMapping = localStorage.getItem('fieldMapping');
    const savedPattern = localStorage.getItem('filenamePattern');
    
    if (savedFormat) {
      setOutputFormat(savedFormat);
    }
    
    if (savedMapping) {
      try {
        setMapping(JSON.parse(savedMapping));
      } catch (err) {
        console.error('Error parsing saved mapping:', err);
      }
    }

    if (savedPattern) {
      setFilenamePattern(savedPattern);
    }

    const fetchPlaceholdersAndHeaders = async () => {
      try {
        const templateId = localStorage.getItem('templateId');
        const dataFileId = localStorage.getItem('dataFileId');

        if (!templateId || !dataFileId) {
          setError('Template or Data File information not found. Please start over.');
          navigate('/');
          return;
        }

        const [templateRes, dataFileRes] = await Promise.all([
          api.getPlaceholders(templateId),
          api.getHeaders(dataFileId)
        ]);

        setPlaceholders(templateRes.data.placeholders);
        setHeaders(dataFileRes.data.headers);
      } catch (error) {
        console.error('Error fetching placeholders and headers:', error);
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.detail || 'Error loading template and data file information.');
        } else {
          setError('Error loading template and data file information. Please try again.');
        }
      }
    };

    fetchPlaceholdersAndHeaders();
  }, [navigate]);

  const handleBack = () => {
    // Save current state before navigating
    localStorage.setItem('outputFormat', outputFormat);
    localStorage.setItem('fieldMapping', JSON.stringify(mapping));
    navigate('/conditions');
  };

  const handleFilenamePatternChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilenamePattern(event.target.value);
    localStorage.setItem('filenamePattern', event.target.value);
  };

  const handleAddPlaceholder = () => {
    if (selectedPlaceholder) {
      const newPattern = filenamePattern + `{{${selectedPlaceholder}}}`;
      setFilenamePattern(newPattern);
      localStorage.setItem('filenamePattern', newPattern);
      setSelectedPlaceholder('');
    }
  };

  const handleGenerateDocuments = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const templateId = localStorage.getItem('templateId');
      const dataFileId = localStorage.getItem('dataFileId');      const processAll = localStorage.getItem('processAll') === 'true';
      const startRow = localStorage.getItem('startRow');
      const endRow = localStorage.getItem('endRow');

      if (!templateId || !dataFileId) {
        throw new Error('Template or Data File ID not found');
      }

      if (Object.keys(mapping).length === 0) {
        throw new Error('Please map at least one placeholder to a header');
      }

      // Save current state
      localStorage.setItem('outputFormat', outputFormat);
      localStorage.setItem('fieldMapping', JSON.stringify(mapping));
      localStorage.setItem('filenamePattern', filenamePattern);

      const payload = {
        template: templateId,
        data_file: dataFileId,
        mapping,
        output_format: outputFormat,
        process_all: processAll,
        start_row: processAll ? null : (startRow ? parseInt(startRow) : null),
        end_row: processAll ? null : (endRow ? parseInt(endRow) : null),
        filename_pattern: filenamePattern
      };

      const response = await api.createGeneration(payload);
      const generationId = response.data.id;

      const genResponse = await api.generateDocuments(generationId);

      const url = window.URL.createObjectURL(new Blob([genResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'generated_documents.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message with animation
      const successPaper = document.createElement('div');
      successPaper.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #16a34a;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        animation: slideUp 0.3s ease-out forwards;
      `;
      successPaper.innerText = 'Documents generated and downloaded successfully!';
      document.body.appendChild(successPaper);
      setTimeout(() => {
        successPaper.style.animation = 'slideDown 0.3s ease-in forwards';
        setTimeout(() => successPaper.remove(), 300);
      }, 3000);
    } catch (error) {
      console.error('Document generation error:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || error.message || 'Error generating documents');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormatChange = (event: SelectChangeEvent<string>) => {
    setOutputFormat(event.target.value);
    localStorage.setItem('outputFormat', event.target.value);
  };

  const handleMappingChange = (placeholder: string) => (event: SelectChangeEvent<string>) => {
    const newMapping = {
      ...mapping,
      [placeholder]: event.target.value
    };
    setMapping(newMapping);
    localStorage.setItem('fieldMapping', JSON.stringify(newMapping));
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
            <DownloadIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2
              }} 
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Generate Documents
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Configure output format and map placeholders to your data
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{
            bgcolor: alpha('#2563eb', 0.04),
            p: 3,
            borderRadius: 2,
          }}>
            <FormControl fullWidth>
              <InputLabel>Output Format</InputLabel>
              <Select
                value={outputFormat}
                label="Output Format"
                onChange={handleFormatChange}
              >
                <MenuItem value="docx">DOCX Document</MenuItem>
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="txt">Text File</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{
            bgcolor: alpha('#2563eb', 0.04),
            p: 3,
            borderRadius: 2,
          }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" gutterBottom>
                  File Naming Pattern
                </Typography>
                <Tooltip title="Use placeholders to create dynamic filenames. For example: invoice_{{customer}}_{{date}}">
                  <InfoIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                label="Filename Pattern"
                value={filenamePattern}
                onChange={handleFilenamePatternChange}
                helperText="Create a pattern for your output filenames using placeholders"
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Add Placeholder</InputLabel>
                  <Select
                    value={selectedPlaceholder}
                    label="Add Placeholder"
                    onChange={(e) => setSelectedPlaceholder(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="id">Row Number</MenuItem>
                    {placeholders.map((placeholder) => (
                      <MenuItem key={placeholder} value={placeholder}>
                        {placeholder}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton 
                  onClick={handleAddPlaceholder}
                  disabled={!selectedPlaceholder}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Available placeholders: {['Row Number', ...placeholders].join(', ')}
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Map Placeholders to Excel Headers
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Match each placeholder from your template to the corresponding column in your Excel file
            </Typography>
            <Stack spacing={2}>
              {placeholders.map((placeholder) => (
                <motion.div
                  key={placeholder}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormControl fullWidth>
                    <InputLabel>{placeholder}</InputLabel>
                    <Select
                      value={mapping[placeholder] || ''}
                      label={placeholder}
                      onChange={handleMappingChange(placeholder)}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>
              ))}
            </Stack>
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
              onClick={handleGenerateDocuments}
              disabled={isGenerating || Object.keys(mapping).length === 0}
              size="large"
              sx={{ 
                px: 4,
                minWidth: '200px'
              }}
              startIcon={isGenerating ? <SyncIcon className="spin" /> : <DownloadIcon />}
            >
              {isGenerating ? 'Generating...' : 'Generate Documents'}
            </Button>
          </Stack>
        </Stack>
      </MotionPaper>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); }
          to { transform: translate(-50%, 0); }
        }
        @keyframes slideDown {
          from { transform: translate(-50%, 0); }
          to { transform: translate(-50%, 100%); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default TaskScreen;
