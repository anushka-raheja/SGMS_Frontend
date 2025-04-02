import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import axios from '../utils/axios';
import GroupPage from '../components/grouppage';

// Mock axios
jest.mock('../utils/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn()
    }))
  }
}));

// Mock GroupDocuments component
jest.mock('../components/groupdocuments', () => {
  return function MockGroupDocuments({ groupId }) {
    return <div data-testid="group-documents">Group Documents for {groupId}</div>;
  };
});

describe('GroupPage Component', () => {
  const mockGroup = {
    _id: '123',
    name: 'Test Group',
    subject: 'Computer Science',
    department: 'Engineering',
    members: [
      { _id: '1', name: 'User 1' },
      { _id: '2', name: 'User 2' }
    ],
    admins: [{ _id: '1', name: 'User 1' }]
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  const renderGroupPage = (groupId = '123') => {
    return render(
      <MemoryRouter initialEntries={[`/groups/${groupId}`]}>
        <Routes>
          <Route path="/groups/:groupId" element={<GroupPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading state initially', () => {
    renderGroupPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders group information after successful fetch', async () => {
    // Mock successful API response
    axios.get.mockResolvedValueOnce({ data: mockGroup });

    renderGroupPage();

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if group information is displayed
    expect(screen.getByText(mockGroup.name)).toBeInTheDocument();
    expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/)).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce({ 
      response: { data: { error: 'Failed to fetch group' } }
    });

    renderGroupPage();

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch group')).toBeInTheDocument();
    });
  });

  test('renders group documents component with correct groupId', async () => {
    axios.get.mockResolvedValueOnce({ data: mockGroup });

    renderGroupPage('123');

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if GroupDocuments component is rendered with correct groupId
    const groupDocuments = screen.getByTestId('group-documents');
    expect(groupDocuments).toBeInTheDocument();
    expect(groupDocuments.textContent).toBe('Group Documents for 123');
  });

  test('handles network error gracefully', async () => {
    // Mock network error
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    renderGroupPage();

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load group')).toBeInTheDocument();
    });
  });

  test('handles empty response data', async () => {
    // Mock empty response
    axios.get.mockResolvedValueOnce({ data: null });

    renderGroupPage();

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load group data')).toBeInTheDocument();
    });
  });
});