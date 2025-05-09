// lib/api.ts
import axios from 'axios'

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to add authorization header when token exists
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Types
export interface User {
  id: number
  username: string
  email: string
  full_name: string
  is_admin: boolean
  is_active: boolean
}

export interface Customer {
  id: number
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
}

export interface TrainingCourse {
  id: number
  title: string
  description: string
  duration_hours: number
}

export interface Trainer {
  id: number
  name: string
  type: 'Employee' | 'Freelancer'
  charge_per_hour: number
  contact_number: string
  phone: string
  email: string
  address: string
  gov_id_number: string
}

export interface TrainingCertification {
  id: number
  name: string
  description: string
  validity_days: number
}

export interface TrainingRegistration {
  id: number
  registration_number: string
  request_date: string
  request_receiver: string
  customer_id: number
  customer_point_of_contact: string
  training_course_id: number
  num_trainees: number
  unit_rate_kd: number
  total_amount_kd: number
  payment_type: 'Cash' | 'Credit'
  trainer_id: number
  training_date: string
  training_time?: string
  training_certification_id?: number
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  remarks?: string
  training_venue?: string
  created_at: string
  updated_at: string
}

export interface TrainingRegistrationConfirmation {
  id: number
  registration_number: string
  training_date: string
  training_time: string
  trainer_name: string
  customer_name: string
  training_course_title: string
  num_trainees: number
  unit_rate_kd: number
  total_amount_kd: number
  training_venue: string
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  remarks?: string
}

// API functions

// Authentication
export const login = async (username: string, password: string) => {
  const response = await api.post('/token', 
    new URLSearchParams({
      username,
      password,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get<User>('/users/me')
  return response.data
}

// Customers
export const getCustomers = async () => {
  const response = await api.get<Customer[]>('/customers')
  return response.data
}

export const getCustomer = async (id: number) => {
  const response = await api.get<Customer>(`/customers/${id}`)
  return response.data
}

export const createCustomer = async (data: Omit<Customer, 'id'>) => {
  const response = await api.post<Customer>('/customers', data)
  return response.data
}

// Training Courses
export const getCourses = async () => {
  const response = await api.get<TrainingCourse[]>('/training-courses')
  return response.data
}

export const getCourse = async (id: number) => {
  const response = await api.get<TrainingCourse>(`/training-courses/${id}`)
  return response.data
}

export const createCourse = async (data: Omit<TrainingCourse, 'id'>) => {
  const response = await api.post<TrainingCourse>('/training-courses', data)
  return response.data
}

// Trainers
export const getTrainers = async () => {
  const response = await api.get<Trainer[]>('/trainers')
  return response.data
}

export const getTrainer = async (id: number) => {
  const response = await api.get<Trainer>(`/trainers/${id}`)
  return response.data
}

export const createTrainer = async (data: Omit<Trainer, 'id'>) => {
  const response = await api.post<Trainer>('/trainers', data)
  return response.data
}

// Training Certifications
export const getCertifications = async () => {
  const response = await api.get<TrainingCertification[]>('/training-certifications')
  return response.data
}

export const getCertification = async (id: number) => {
  const response = await api.get<TrainingCertification>(`/training-certifications/${id}`)
  return response.data
}

export const createCertification = async (data: Omit<TrainingCertification, 'id'>) => {
  const response = await api.post<TrainingCertification>('/training-certifications', data)
  return response.data
}

// Training Registrations
export const getRegistrations = async () => {
  const response = await api.get<TrainingRegistration[]>('/training-registrations')
  return response.data
}

export const getRegistration = async (id: number) => {
  const response = await api.get<TrainingRegistration>(`/training-registrations/${id}`)
  return response.data
}

export const createRegistration = async (data: Omit<TrainingRegistration, 'id' | 'registration_number' | 'created_at' | 'updated_at'>) => {
  const response = await api.post<TrainingRegistration>('/training-registrations', data)
  return response.data
}

export const updateRegistrationStatus = async (id: number, status: TrainingRegistration['status']) => {
  const response = await api.put<TrainingRegistration>(`/training-registrations/${id}/status`, { status })
  return response.data
}

// Training Confirmations
export const createConfirmation = async (data: {
  training_registration_id: number
  training_date: string
  training_time: string
  trainer_id: number
  training_venue: string
  remarks?: string
}) => {
  const response = await api.post<TrainingRegistrationConfirmation>('/training-confirmations', data)
  return response.data
}

export default api