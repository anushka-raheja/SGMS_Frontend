import React from 'react';
import { screen, fireEvent, waitFor } from '../test-utils';
import { renderWithRouter } from '../test-utils';
import '@testing-library/jest-dom';
import GroupsList from '../components/grouplist';
import axiosInstance from '../utils/axios';

// Mock the axios instance with proper implementation
jest.mock('../utils/axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn()
      },
      response: {
        use: jest.fn(),
        eject: jest.fn()
      }
    }
  };
  return mockAxiosInstance;
});

// Mock the window.location.hostname
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost'
  },
  writable: true
});

describe('GroupsList Component', () => {
  const mockGroups = [
    {
      _id: '1',
      name: 'Test Group 1',
      description: 'Test Description 1',
      subject: 'Mathematics',
      members: ['user1', 'user2'],
      createdBy: 'user1',
      isPublic: true
    },
    {
      _id: '2',
      name: 'Test Group 2',
      description: 'Test Description 2',
      subject: 'Physics',
      members: ['user1', 'user3'],
      createdBy: 'user2',
      isPublic: false
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'mock-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  test('renders GroupsList component correctly', () => {
    renderWithRouter(<GroupsList />);
    
    // expect(screen.getByText(/Available Study Groups/i)).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    renderWithRouter(<GroupsList />);
    
    expect(screen.getByText(/Loading groups/i)).toBeInTheDocument();
  });

  test('displays groups when data is loaded successfully', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockGroups });

    renderWithRouter(<GroupsList />);

    // Wait for groups to load
    const group1 = await screen.findByText('Test Group 1');
    const group2 = await screen.findByText('Test Group 2');

    expect(group1).toBeInTheDocument();
    expect(group2).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithRouter(<GroupsList />);

    // Wait for error message
    const errorMessage = await screen.findByText(/Error: Failed to load groups/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays "No groups available" message when no groups exist', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] });

    renderWithRouter(<GroupsList />);

    // Wait for the message to appear
    const message = await screen.findByText(/No study groups available to join/i);
    expect(message).toBeInTheDocument();
  });

  test('renders group details correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockGroups });

    renderWithRouter(<GroupsList />);

    // Wait for groups to load
    await screen.findByText('Test Group 1');

    // Check if group details are displayed
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    // expect(screen.getByText('2 members')).toBeInTheDocument();
  });

  test('displays public/private badges correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockGroups });

    renderWithRouter(<GroupsList />);

    // Wait for groups to load
    await screen.findByText('Test Group 1');

    // Check if privacy badges are displayed
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });
}); 