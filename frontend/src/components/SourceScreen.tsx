import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Stack,
  Alert,
  LinearProgress,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import * as api from '../services/api';

const MotionPaper = motion(Paper);

interface StoredFileInfo {
  name: string;
  id: string;
}

interface UploadBoxProps {
  title: string;
  accept: string;
  file: File | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  allowedExtensions: string[];
  errorMessage: string;
}

const UploadBox = ({ 
  title, 
  accept, 
  file, 
  onChange,
  allowedExtensions,
  errorMessage
}: UploadBoxProps) => (
  <Box
    sx={{
      border: '2px dashed',
      borderColor: file ? 'primary.main' : 'grey.300',
      borderRadius: 2,
      p: 4,
      bgcolor: file ? alpha('#2563eb', 0.04) : 'background.paper',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'primary.main',
        bgcolor: alpha('#2563eb', 0.04),
      },
    }}
    component="label"
  >
    <input
      type="file"
      onChange={onChange}
      accept={accept}
      style={{ display: 'none' }}
    />
    <Stack spacing={2} alignItems="center">
      {file ? (
        <CheckCircleIcon color="primary" sx={{ fontSize: 40 }} />
      ) : (
        <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500' }} />
      )}
      <Typography variant="h6" align="center" color={file ? 'primary' : 'textSecondary'}>
        {file ? file.name : title}
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
        {file ? 'Click to change file' : 'Click to upload'}
      </Typography>
    </Stack>
  </Box>
);

const SourceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved file information on component mount
  useEffect(() => {
    try {
      const storedTemplateInfo = localStorage.getItem('templateFileInfo');
      const storedDataFileInfo = localStorage.getItem('dataFileInfo');

      if (storedTemplateInfo) {
        const templateInfo: StoredFileInfo = JSON.parse(storedTemplateInfo);
        const dummyTemplateFile = new File([], templateInfo.name);
        setTemplateFile(dummyTemplateFile);
      }

      if (storedDataFileInfo) {
        const dataFileInfo: StoredFileInfo = JSON.parse(storedDataFileInfo);
        const dummyDataFile = new File([], dataFileInfo.name);
        setDataFile(dummyDataFile);
      }
    } catch (error) {
      console.error('Error loading stored file information:', error);
    }
  }, []);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const validateFile = (file: File, allowedExtensions: string[]): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size cannot exceed 5MB'
      };
    }

    // Check file extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed extensions: ${allowedExtensions.join(', ')}`
      };
    }

    return { valid: true };
  };
  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedExtensions = ['.doc', '.docx'];
      
      const validation = validateFile(file, allowedExtensions);
      if (!validation.valid) {
        setError(validation.error || 'Invalid template file');
        event.target.value = ''; // Clear the file input
        return;
      }

      setTemplateFile(file);
      setError(null);
      // Clear previous template data
      localStorage.removeItem('templateId');
      localStorage.removeItem('templateFileInfo');
    }
  };

  const handleDataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedExtensions = ['.xls', '.xlsx', '.xlsm'];
      
      const validation = validateFile(file, allowedExtensions);
      if (!validation.valid) {
        setError(validation.error || 'Invalid data file');
        event.target.value = ''; // Clear the file input
        return;
      }

      setDataFile(file);
      setError(null);
      // Clear previous data file data
      localStorage.removeItem('dataFileId');
      localStorage.removeItem('dataFileInfo');
    }
  };

  const handleContinue = async () => {
    if (!templateFile || !dataFile) {
      setError('Please upload both template and data files');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let templateResponse;
      let dataResponse;

      // Only upload template file if no ID exists
      const existingTemplateInfo = localStorage.getItem('templateFileInfo');
      if (!existingTemplateInfo) {
        const formData = new FormData();
        formData.append('template_file', templateFile);
        templateResponse = await api.uploadTemplate(formData);
        localStorage.setItem('templateId', templateResponse.data.id);
        localStorage.setItem('templateFileInfo', JSON.stringify({
          name: templateFile.name,
          id: templateResponse.data.id
        }));
      }

      // Only upload data file if no ID exists
      const existingDataInfo = localStorage.getItem('dataFileInfo');
      if (!existingDataInfo) {
        const dataFormData = new FormData();
        dataFormData.append('data_file', dataFile);
        dataResponse = await api.uploadDataFile(dataFormData);
        localStorage.setItem('dataFileId', dataResponse.data.id);
        localStorage.setItem('dataFileInfo', JSON.stringify({
          name: dataFile.name,
          id: dataResponse.data.id
        }));
      }

      navigate('/conditions');
    } catch (err) {
      console.error('Error uploading files:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error uploading files. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Document Generator
          </Typography>
          
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

          <Stack spacing={3}>            <UploadBox
              title="Upload Template File (DOC/DOCX)"
              accept=".doc,.docx"
              file={templateFile}
              onChange={handleTemplateUpload}
              allowedExtensions={['.doc', '.docx']}
              errorMessage="Please upload a valid document file (DOC or DOCX)"
            />
            
            <UploadBox
              title="Upload Data File (XLS/XLSX/XLSM)"
              accept=".xls,.xlsx,.xlsm"
              file={dataFile}
              onChange={handleDataUpload}
              allowedExtensions={['.xls', '.xlsx', '.xlsm']}
              errorMessage="Please upload a valid Excel file (XLS, XLSX, or XLSM)"
            />
          </Stack>

          <Box>
            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
              disabled={loading || !templateFile || !dataFile}
              fullWidth
              size="large"
            >
              {loading ? 'Uploading...' : 'Continue'}
            </Button>
          </Box>
        </Stack>
      </MotionPaper>
    </Container>
  );
};

export default SourceScreen;
