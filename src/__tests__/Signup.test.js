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

// Mock axios
jest.mock('../utils/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../components/signup';
import axios from '../utils/axios';

describe('SignUp Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('renders signup form', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        message: 'User created successfully'
      }
    };
    axios.post.mockResolvedValueOnce(mockResponse);

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

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

    // Wait for the API call to complete and token to be stored
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/signup', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles signup error', async () => {
    const errorMessage = 'Email already exists';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

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

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('clears error when user types', async () => {
    const errorMessage = 'Email already exists';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Fill in the form and submit to trigger error
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

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Type in any field
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'New Name' }
    });

    // Check that error message is cleared
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });
}); 