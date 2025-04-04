import React from 'react';
import { screen, fireEvent, waitFor, act } from '../test-utils';
import { renderWithRouter } from '../test-utils';
import '@testing-library/jest-dom';
import GroupsList from '../components/grouplist';
import axiosInstance from '../utils/axios';

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
    jest.clearAllMocks();
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

  test('renders GroupsList component correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] });
    
    await act(async () => {
      renderWithRouter(<GroupsList />);
    });
    
  });

  test('displays loading state initially', async () => {
    axiosInstance.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
    );
    
    let getByTextFn;
    await act(async () => {
      const { getByText } = renderWithRouter(<GroupsList />);
      getByTextFn = getByText;
    });
    
    expect(getByTextFn(/Loading groups/i)).toBeInTheDocument();
  });

  test('displays groups when data is loaded successfully', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockGroups });

    await act(async () => {
      renderWithRouter(<GroupsList />);
    });

    expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    expect(screen.getByText('Test Group 2')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    await act(async () => {
      renderWithRouter(<GroupsList />);
    });

    expect(screen.getByText(/Error: Failed to load groups/i)).toBeInTheDocument();
  });

  test('displays "No groups available" message when no groups exist', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      renderWithRouter(<GroupsList />);
    });

    expect(screen.getByText(/No study groups available to join/i)).toBeInTheDocument();
  });

  test('renders group details correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockGroups });

    await act(async () => {
      renderWithRouter(<GroupsList />);
    });

    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
  });

  test('displays public/private badges correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockGroups });

    await act(async () => {
      renderWithRouter(<GroupsList />);
    });

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });
}); 