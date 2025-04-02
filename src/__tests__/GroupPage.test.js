import React from 'react';
import { screen, waitFor } from '../test-utils';
import { renderWithRouter } from '../test-utils';
import '@testing-library/jest-dom';
import GroupPage from '../components/grouppage';
import axios from '../utils/axios';

// Mock the axios module
jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ groupId: 'mock-group-id' })
}));

// Mock the child components
jest.mock('../components/groupsessions', () => () => <div data-testid="mock-sessions">Sessions Mock</div>);
jest.mock('../components/groupdocuments', () => () => <div data-testid="mock-documents">Documents Mock</div>);

describe('GroupPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    // Make the axios request never resolve to keep the component in loading state
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<GroupPage />);
    
    expect(screen.getByText(/Loading group information/i)).toBeInTheDocument();
  });

  test('shows error state when API call fails', async () => {
    // Mock a failed API call
    axios.get.mockRejectedValueOnce({ 
      response: { data: { error: 'Group not found or access denied' } } 
    });
    
    renderWithRouter(<GroupPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Group not found or access denied/i)).toBeInTheDocument();
    });
  });

  test('shows error when response is undefined', async () => {
    // Mock undefined response
    axios.get.mockResolvedValueOnce(undefined);
    
    renderWithRouter(<GroupPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/No data received from server/i)).toBeInTheDocument();
    });
  });

  test('renders group data when API call succeeds', async () => {
    // Mock a successful API call
    const mockGroup = {
      _id: 'mock-group-id',
      name: 'Test Group',
      subject: 'Computer Science',
      members: ['user1', 'user2', 'user3']
    };
    
    axios.get.mockResolvedValueOnce({ data: mockGroup });
    
    renderWithRouter(<GroupPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
      expect(screen.getByText(/Members:/i)).toBeInTheDocument();
      expect(screen.getByTestId('mock-sessions')).toBeInTheDocument();
      expect(screen.getByTestId('mock-documents')).toBeInTheDocument();
    });
  });
});