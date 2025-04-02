import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../components/signin';

// Mock axios
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock('../utils/axios', () => {
  const axios = {
    create: jest.fn(() => mockAxiosInstance)
  };
  return axios;
});

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
    mockAxiosInstance.post.mockClear();
  });

  it('renders signin form', () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

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
    mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/signin', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', 'mock-user-id');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles signin error', async () => {
    const errorMessage = 'Invalid credentials';
    mockAxiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});