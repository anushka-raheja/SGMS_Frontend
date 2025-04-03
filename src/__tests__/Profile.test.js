import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import '@testing-library/jest-dom';
import Profile from '../components/Profile';
import axios from '../utils/axios';

// Mock axios
jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  defaults: {
    headers: { common: {} }
  }
}));

describe('Profile Component', () => {
  const mockUserData = {
    name: 'Test User',
    email: 'test@example.com',
    department: 'Computer Science'
  };

  const mockGroups = [
    { _id: '1', name: 'Group 1', subject: 'Math' },
    { _id: '2', name: 'Group 2', subject: 'Physics' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays authentication error when not authenticated', () => {
    renderWithRouter(<Profile />);
    expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
  });

  it('displays user profile data when authenticated and loaded', async () => {
    // Mock successful authentication
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('fake-token'),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });

    // Mock successful API responses
    axios.get
      .mockResolvedValueOnce({ data: mockUserData })
      .mockResolvedValueOnce({ data: mockGroups });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      // Check for profile header with user's name
      expect(screen.getByText(`${mockUserData.name}'s Profile`)).toBeInTheDocument();
      // Check for email in the expected format
      expect(screen.getByText(new RegExp(mockUserData.email))).toBeInTheDocument();
      // Check for department in the expected format
      expect(screen.getByText(new RegExp(mockUserData.department))).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
    });
  });
}); 