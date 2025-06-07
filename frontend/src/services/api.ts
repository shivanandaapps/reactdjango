import axios, { AxiosResponse } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Response Interfaces
interface PlaceholdersResponse {
    placeholders: string[];
}

interface HeadersResponse {
    headers: string[];
}

interface GenerationResponse {
    id: string;
}

// API functions
export const uploadTemplate = async (formData: FormData): Promise<AxiosResponse<GenerationResponse>> => {
    return axios.post(`${API_URL}/api/templates/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const uploadDataFile = async (formData: FormData): Promise<AxiosResponse<GenerationResponse>> => {
    return axios.post(`${API_URL}/api/datafiles/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getPlaceholders = async (templateId: string): Promise<AxiosResponse<PlaceholdersResponse>> => {
    return axios.post(`${API_URL}/api/templates/${templateId}/extract_placeholders/`);
};

export const getHeaders = async (dataFileId: string): Promise<AxiosResponse<HeadersResponse>> => {
    return axios.get(`${API_URL}/api/datafiles/${dataFileId}/get_headers/`);
};

export const generateDocuments = async (generationId: string): Promise<AxiosResponse<Blob>> => {
    return axios.post(`${API_URL}/api/generations/${generationId}/generate_documents/`, {}, {
        responseType: 'blob'
    });
};

export const createGeneration = async (payload: any): Promise<AxiosResponse<GenerationResponse>> => {
    return axios.post(`${API_URL}/api/generations/`, payload);
};
