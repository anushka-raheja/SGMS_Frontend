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
jest.mock('../utils/axios', () => {
  return {
    post: jest.fn()
  };
});

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import SignUp from '../components/signup';
import axios from '../utils/axios';

// Mock environment variable
process.env.REACT_APP_API_URL = 'http://localhost:5001';

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    renderWithRouter(<SignUp />);

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    // Setup mock response to match exactly what the userController.js returns
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: {
          _id: 'user-id',
          name: 'Test User',
          email: 'test@example.com'
        },
        message: 'User created successfully'
      }
    };
    
    // Setup axios mock to return our response
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

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Use waitFor with only one expectation to ensure stable testing
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/signup', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    // Check localStorage and navigation in separate waitFor blocks
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', 'user-id');
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles signup error', async () => {
    // Mock axios rejection with error structure from backend
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

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });
}); 