import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import '@testing-library/jest-dom';
import Profile from '../components/profile';
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
    // Clear any localStorage mocks
    if (window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('displays authentication error when not authenticated', () => {
    renderWithRouter(<Profile />);
    expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
  });

  it('displays user profile data when authenticated and loaded', async () => {
    // Set up localStorage before component renders
    const token = 'fake-token';
    Storage.prototype.getItem = jest.fn(() => token);

    // Mock successful API responses
    axios.get
      .mockResolvedValueOnce({ data: mockUserData })
      .mockResolvedValueOnce({ data: mockGroups });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/User Profile/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(mockUserData.name)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(mockUserData.email))).toBeInTheDocument();
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