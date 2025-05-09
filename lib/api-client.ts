// lib/api-client.ts

import axios from 'axios';

// Create an API client instance
const createApiClient = () => {
  // Get API URL from environment
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Create axios instance
  const client = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Add auth interceptor
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage (only on client side)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return client;
};

// Helper function for form data requests
const createFormDataClient = () => {
  // Get API URL from environment
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const client = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  // Add auth interceptor
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage (only on client side)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return client;
};

// Create API client instance
const apiClient = createApiClient();

// Types
export type User = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
};

export type Customer = {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
};

export type TrainingCourse = {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
};

export type Trainer = {
  id: number;
  name: string;
  type: 'Employee' | 'Freelancer';
  charge_per_hour: number;
  contact_number: string;
  phone: string;
  email: string;
  address: string;
  gov_id_number: string;
};

export type TrainingCertification = {
  id: number;
  name: string;
  description: string;
  validity_days: number;
};

export type TrainingRegistration = {
  id: number;
  registration_number: string;
  request_date: string;
  request_receiver: string;
  customer_id: number;
  customer_point_of_contact: string;
  training_course_id: number;
  num_trainees: number;
  unit_rate_kd: number;
  total_amount_kd: number;
  payment_type: 'Cash' | 'Credit';
  trainer_id: number;
  training_date: string;
  training_time: string | null;
  training_certification_id: number | null;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  remarks: string | null;
  training_venue: string | null;
  created_at: string;
  updated_at: string;
};

export type Trainee = {
  id: number;
  name: string;
  civil_id: string;
  company_name: string;
  photo_path: string | null;
  training_registration_id: number | null;
  training_completion_date: string | null;
  certificate_validation_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TraineeFormData = {
  name: string;
  civil_id: string;
  company_name: string;
  photo?: File;
  training_completion_date?: string;
  certificate_validation_date?: string;
};

// API Functions

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get('/customers/');
  return response.data;
};

export const getCustomer = async (id: number): Promise<Customer> => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: Omit<Customer, 'id'>): Promise<Customer> => {
  const response = await apiClient.post('/customers/', data);
  return response.data;
};

export const updateCustomer = async (id: number, data: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
};

// Training Courses
export const getCourses = async (): Promise<TrainingCourse[]> => {
  const response = await apiClient.get('/training-courses/');
  return response.data;
};

export const getCourse = async (id: number): Promise<TrainingCourse> => {
  const response = await apiClient.get(`/training-courses/${id}`);
  return response.data;
};

export const createCourse = async (data: Omit<TrainingCourse, 'id'>): Promise<TrainingCourse> => {
  const response = await apiClient.post('/training-courses/', data);
  return response.data;
};

export const updateCourse = async (id: number, data: Partial<TrainingCourse>): Promise<TrainingCourse> => {
  const response = await apiClient.put(`/training-courses/${id}`, data);
  return response.data;
};

// Trainers
export const getTrainers = async (): Promise<Trainer[]> => {
  const response = await apiClient.get('/trainers/');
  return response.data;
};

export const getTrainer = async (id: number): Promise<Trainer> => {
  const response = await apiClient.get(`/trainers/${id}`);
  return response.data;
};

export const createTrainer = async (data: Omit<Trainer, 'id'>): Promise<Trainer> => {
  const response = await apiClient.post('/trainers/', data);
  return response.data;
};

export const updateTrainer = async (id: number, data: Partial<Trainer>): Promise<Trainer> => {
  const response = await apiClient.put(`/trainers/${id}`, data);
  return response.data;
};

export const deleteTrainer = async (id: number): Promise<void> => {
  await apiClient.delete(`/trainers/${id}`);
};

// Certifications
export const getCertifications = async (): Promise<TrainingCertification[]> => {
  const response = await apiClient.get('/training-certifications/');
  return response.data;
};

export const getCertification = async (id: number): Promise<TrainingCertification> => {
  const response = await apiClient.get(`/training-certifications/${id}`);
  return response.data;
};

export const createCertification = async (data: Omit<TrainingCertification, 'id'>): Promise<TrainingCertification> => {
  const response = await apiClient.post('/training-certifications/', data);
  return response.data;
};

// Registrations
export const getRegistrations = async (): Promise<TrainingRegistration[]> => {
  const response = await apiClient.get('/training-registrations/');
  return response.data;
};

export const getRegistration = async (id: number): Promise<TrainingRegistration> => {
  const response = await apiClient.get(`/training-registrations/${id}`);
  return response.data;
};

export const createRegistration = async (data: Omit<TrainingRegistration, 'id' | 'registration_number' | 'created_at' | 'updated_at'>): Promise<TrainingRegistration> => {
  const response = await apiClient.post('/training-registrations/', data);
  return response.data;
};

export const updateRegistrationStatus = async (id: number, status: TrainingRegistration['status']): Promise<TrainingRegistration> => {
  const response = await apiClient.put(`/training-registrations/${id}/status?status=${status}`);
  return response.data;
};

// Trainees
export const getTrainees = async (): Promise<Trainee[]> => {
  const response = await apiClient.get('/trainees/');
  return response.data;
};

export const getUnassignedTrainees = async (): Promise<Trainee[]> => {
  const response = await apiClient.get('/trainees/unassigned');
  return response.data;
};

export const getTraineeById = async (id: number): Promise<Trainee> => {
  const response = await apiClient.get(`/trainees/${id}`);
  return response.data;
};

export const getTraineesByRegistrationId = async (registrationId: number): Promise<Trainee[]> => {
  const response = await apiClient.get(`/training-registrations/${registrationId}/trainees`);
  return response.data;
};

export const createTrainee = async (traineeData: TraineeFormData): Promise<Trainee> => {
  const formDataClient = createFormDataClient();
  const formData = new FormData();
  
  formData.append('name', traineeData.name);
  formData.append('civil_id', traineeData.civil_id);
  formData.append('company_name', traineeData.company_name);
  
  if (traineeData.photo) {
    formData.append('photo', traineeData.photo);
  }
  
  if (traineeData.training_completion_date) {
    formData.append('training_completion_date', traineeData.training_completion_date);
  }
  
  if (traineeData.certificate_validation_date) {
    formData.append('certificate_validation_date', traineeData.certificate_validation_date);
  }
  
  const response = await formDataClient.post('/trainees/', formData);
  return response.data;
};

export const updateTrainee = async (id: number, traineeData: Partial<TraineeFormData>): Promise<Trainee> => {
  const formDataClient = createFormDataClient();
  const formData = new FormData();
  
  if (traineeData.name) {
    formData.append('name', traineeData.name);
  }
  
  if (traineeData.civil_id) {
    formData.append('civil_id', traineeData.civil_id);
  }
  
  if (traineeData.company_name) {
    formData.append('company_name', traineeData.company_name);
  }
  
  if (traineeData.photo) {
    formData.append('photo', traineeData.photo);
  }
  
  if (traineeData.training_completion_date) {
    formData.append('training_completion_date', traineeData.training_completion_date);
  }
  
  if (traineeData.certificate_validation_date) {
    formData.append('certificate_validation_date', traineeData.certificate_validation_date);
  }
  
  const response = await formDataClient.put(`/trainees/${id}`, formData);
  return response.data;
};

export const deleteTrainee = async (id: number): Promise<boolean> => {
  await apiClient.delete(`/trainees/${id}`);
  return true;
};

export const assignTraineeToRegistration = async (traineeId: number, registrationId: number): Promise<Trainee> => {
  const formDataClient = createFormDataClient();
  const formData = new FormData();
  formData.append('registration_id', registrationId.toString());
  
  const response = await formDataClient.post(`/trainees/${traineeId}/assign-registration`, formData);
  return response.data;
};


// Auth
export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await axios.post(`${apiClient.defaults.baseURL}/token`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/users/me/');
  return response.data;
};

export default apiClient;