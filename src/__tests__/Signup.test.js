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
    // ARRANGE - Create a successful response
    const successResponse = {
      data: {
        token: 'mock-token',
        user: {
          _id: 'user-id',
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    };
    
    // Set up the API mock to resolve with our success response
    axios.post.mockResolvedValue(successResponse);
    
    // ACT - Render component
    renderWithRouter(<SignUp />);
    
    // Fill the form
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
    
    // ASSERT - Check API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/signup',
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      );
    });
    
    // Simple test - since we're mocking everything, verify the function was called 
    // in any order with any arguments
    await waitFor(() => {
      // First check if function was called at all
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    
    // Then check specific calls 
    await waitFor(() => {
      // Find the call with 'token' as first argument
      const tokenCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'token'
      );
      expect(tokenCall).toBeTruthy();
      expect(tokenCall[1]).toBe('mock-token');
      
      // Find the call with 'userId' as first argument
      const userIdCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'userId'
      );
      expect(userIdCall).toBeTruthy();
      expect(userIdCall[1]).toBe('user-id');
    });
    
    // Check navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles signup error', async () => {
    // ARRANGE - Create an error response
    const errorResponse = {
      response: {
        data: {
          message: 'Email already exists'
        }
      }
    };
    
    // Set up the API mock to reject with our error
    axios.post.mockRejectedValue(errorResponse);
    
    // ACT - Render component
    renderWithRouter(<SignUp />);
    
    // Fill the form
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
    
    // ASSERT - Check for error message
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
    
    // Verify localStorage was NOT called
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    
    // Verify navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
}); 