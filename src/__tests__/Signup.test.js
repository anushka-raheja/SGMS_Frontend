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

// Helper to wait for all promises to resolve
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

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
    
    // Use immediate mock implementation
    axios.post.mockImplementation(() => Promise.resolve(mockResponse));
    
    await act(async () => {
      renderWithRouter(<SignUp />);
    });

    // Fill in the form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
    });

    // Submit the form and wait for all promises to resolve
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      // Wait for all promises to resolve
      await flushPromises();
    });

    // Verify API call
    expect(axios.post).toHaveBeenCalledWith('/api/auth/signup', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Wait for state to update and verify localStorage and navigation
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', 'user-id');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 3000 });  // Increased timeout for CI environments
  });

  it('handles signup error', async () => {
    // Mock axios rejection with immediate implementation
    axios.post.mockImplementation(() => 
      Promise.reject({
        response: {
          data: { message: 'Email already exists' }
        }
      })
    );

    await act(async () => {
      renderWithRouter(<SignUp />);
    });

    // Fill in the form (combined into one act for efficiency)
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
    });

    // Submit the form and wait for promises
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      // Wait for all promises to resolve
      await flushPromises();
    });

    // Check error message with waitFor for consistency
    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 