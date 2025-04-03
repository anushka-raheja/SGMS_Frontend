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
    // Mock localStorage.getItem to return a token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'some-token'),
      },
      writable: true
    });
  });

  afterEach(() => {
    // Clean up localStorage mock
    jest.restoreAllMocks();
  });

  it('displays authentication error when not authenticated', () => {
    // Override the localStorage mock for this specific test
    window.localStorage.getItem.mockReturnValueOnce(null);
    renderWithRouter(<Profile />);
    expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
  });

  it('displays user profile data when loaded', async () => {
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === '/api/users/me') {
        return Promise.resolve({ data: mockUserData });
      }
      if (url === '/api/groups/my-groups') {
        return Promise.resolve({ data: mockGroups });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithRouter(<Profile />);

    // First verify loading state
    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading profile/i)).not.toBeInTheDocument();
    });

    // Now check for the profile content
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText(`${mockUserData.name}'s Profile`)).toBeInTheDocument();
    
    // Check for contact information
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.email)).toBeInTheDocument();
    
    expect(screen.getByText(/Department:/i)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.department)).toBeInTheDocument();

    // Check for groups
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderWithRouter(<Profile />);
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });
}); 