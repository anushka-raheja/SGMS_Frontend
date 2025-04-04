import React from 'react';
import { screen, fireEvent, waitFor } from '../test-utils';
import { renderWithRouter } from '../test-utils';
import SignIn from '../components/signin';

jest.mock('../utils/axios', () => ({
  post: jest.fn()
}));

import axios from '../utils/axios';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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
    
    const form = screen.getByTestId('signin-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/signin', {
        email: 'test@example.com',
        password: 'password123'
      });
    }, { timeout: 5000 });
  });

  it('displays error message when signin fails', async () => {
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
    
    const form = screen.getByTestId('signin-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});