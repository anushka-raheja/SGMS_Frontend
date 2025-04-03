// Set timeout for all tests
jest.setTimeout(10000);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock useNavigate
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock our custom axios instance
jest.mock('../utils/axios', () => ({
  post: jest.fn()
}));

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import SignUp from '../components/signup';
import axios from '../utils/axios';

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    renderWithRouter(<SignUp />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Select Department')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('submits data to API when form is submitted', async () => {
    // Mock the API response
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { _id: 'user-id' }
      }
    };
    
    // Mock the API call
    axios.post.mockResolvedValue(mockResponse);
    
    renderWithRouter(<SignUp />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    // Select department from dropdown
    const departmentSelect = screen.getByRole('combobox');
    fireEvent.change(departmentSelect, {
      target: { value: 'Computer Science & Engineering' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Wait for the API call and verify
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/signup',
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          department: 'Computer Science & Engineering'
        }
      );
    });
  });

  it('displays error message when signup fails', async () => {
    // Mock the error response
    axios.post.mockRejectedValue({
      response: {
        data: { message: 'Email already exists' }
      }
    });
    
    renderWithRouter(<SignUp />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    // Select department from dropdown
    const departmentSelect = screen.getByRole('combobox');
    fireEvent.change(departmentSelect, {
      target: { value: 'Computer Science & Engineering' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });
}); 