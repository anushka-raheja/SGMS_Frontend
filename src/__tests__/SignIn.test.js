import React from 'react';
import { screen, fireEvent, waitFor } from '../test-utils';
import { renderWithRouter } from '../test-utils';
import SignIn from '../components/signin';

// Mock axios with a factory function
jest.mock('../utils/axios', () => ({
  post: jest.fn()
}));

// Import the mocked module
import axios from '../utils/axios';

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

describe('SignIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signin form', () => {
    renderWithRouter(<SignIn />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits data to API when form is submitted', async () => {
    // Simplest possible test - only verify API is called with correct data
    const mockResponse = {
      data: {
        token: 'mock-token',
        userId: 'mock-user-id',
        message: 'Login successful'
      }
    };
    axios.post.mockResolvedValue(mockResponse);
    
    renderWithRouter(<SignIn />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    const form = screen.getByTestId('signin-form');
    fireEvent.submit(form);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/signin', {
        email: 'test@example.com',
        password: 'password123'
      });
    }, { timeout: 5000 });
  });

  it('displays error message when signin fails', async () => {
    // Simple error test
    axios.post.mockRejectedValue({
      response: { 
        data: { error: 'Invalid credentials' } 
      }
    });
    
    renderWithRouter(<SignIn />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    const form = screen.getByTestId('signin-form');
    fireEvent.submit(form);
    
    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});