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

  it('submits data to API when form is submitted', async () => {
    // Simplest possible test - only verify API is called with correct data
    axios.post.mockResolvedValue({
      data: {
        token: 'mock-token',
        user: { _id: 'user-id' }
      }
    });
    
    renderWithRouter(<SignUp />);
    
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/signup',
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      );
    }, { timeout: 5000 });
  });

  it('displays error message when signup fails', async () => {
    // Simple error test
    axios.post.mockRejectedValue({
      response: {
        data: { message: 'Email already exists' }
      }
    });
    
    renderWithRouter(<SignUp />);
    
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
}); 