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

// Mock axios directly
jest.mock('axios', () => ({
  post: jest.fn()
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from '../components/signup';
import axios from 'axios';

// Mock environment variable
process.env.REACT_APP_API_URL = 'http://localhost:5001';

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    render(<SignUp />);

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    axios.post.mockResolvedValueOnce({});
    
    render(<SignUp />);

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

    // Wait for the API call to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/auth/signup', 
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      );
    });
  });

  it('handles signup error', async () => {
    // Mock the window.alert
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Mock console.error
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock axios rejection
    axios.post.mockRejectedValueOnce({
      response: {
        data: 'Email already exists'
      }
    });

    render(<SignUp />);

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

    // Wait for the alert to be called
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error during sign-up');
      expect(mockConsoleError).toHaveBeenCalled();
    });

    // Clean up mocks
    mockAlert.mockRestore();
    mockConsoleError.mockRestore();
  });
}); 