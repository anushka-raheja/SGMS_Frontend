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
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import SignUp from '../components/signup';
import axios from '../utils/axios';

// Mock environment variable
process.env.REACT_APP_API_URL = 'http://localhost:5001';

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.setItem.mockClear();
    mockNavigate.mockClear();
    axios.post.mockClear();
  });

  it('renders signup form', async () => {
    await act(async () => {
      renderWithRouter(<SignUp />);
    });

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    // Setup mock response to exactly match what the component expects
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
    
    axios.post.mockResolvedValue(mockResponse);
    
    await act(async () => {
      renderWithRouter(<SignUp />);
    });

    // Fill in the form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Test User' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    // Directly check that the API was called with correct data
    expect(axios.post).toHaveBeenCalledWith('/api/auth/signup', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Directly check localStorage and navigation
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.data.token);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', mockResponse.data.user._id);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles signup error', async () => {
    // Mock axios rejection
    axios.post.mockRejectedValue({
      response: {
        data: { message: 'Email already exists' }
      }
    });

    await act(async () => {
      renderWithRouter(<SignUp />);
    });

    // Fill in the form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Test User' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    // Check that error message is displayed
    expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
  });
}); 