import React from 'react';
import { screen, fireEvent, waitFor, act } from '../test-utils';
import { renderWithRouter } from '../test-utils';
import SignIn from '../components/signin';

// Mock axios with a factory function
jest.mock('../utils/axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
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
    localStorageMock.setItem.mockClear();
    mockNavigate.mockClear();
    axios.post.mockClear();
  });

  it('renders signin form', async () => {
    await act(async () => {
      renderWithRouter(<SignIn />);
    });

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful signin', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        userId: 'mock-user-id',
        message: 'Login successful'
      }
    };
    axios.post.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      renderWithRouter(<SignIn />);
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
    
    // Submit the form instead of just clicking the button
    await act(async () => {
      const form = screen.getByRole('form');
      fireEvent.submit(form);
    });

    // Verify the API call happened correctly
    expect(axios.post).toHaveBeenCalledWith('/api/auth/signin', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Check side effects after the async operation completed
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', 'mock-user-id');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles signin error', async () => {
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    await act(async () => {
      renderWithRouter(<SignIn />);
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'wrongpassword' }
      });
    });
    
    // Submit the form instead of just clicking the button
    await act(async () => {
      const form = screen.getByRole('form');
      fireEvent.submit(form);
    });

    // Wait for error state to be set
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Verify that localStorage and navigation weren't called
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});