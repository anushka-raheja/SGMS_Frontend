import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GroupPage from '../components/grouppage';

// Mock axios
jest.mock('../utils/axios', () => ({
  get: jest.fn()
}));

// Import the mocked axios
import axios from '../utils/axios';

// Mock GroupDocuments component
jest.mock('../components/groupdocuments', () => {
  return function MockGroupDocuments() {
    return <div data-testid="group-documents">Group Documents</div>;
  };
});

describe('GroupPage Component', () => {
  const mockGroup = {
    _id: '123',
    name: 'Test Group',
    subject: 'Computer Science',
    members: [
      { _id: '1', name: 'User 1' },
      { _id: '2', name: 'User 2' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/groups/123']}>
        <Routes>
          <Route path="/groups/:groupId" element={<GroupPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders group information after successful fetch', async () => {
    // Mock successful API response
    axios.get.mockResolvedValueOnce({ data: mockGroup });

    render(
      <MemoryRouter initialEntries={['/groups/123']}>
        <Routes>
          <Route path="/groups/:groupId" element={<GroupPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if group information is displayed
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('Subject: Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Members: 2')).toBeInTheDocument();
    expect(screen.getByTestId('group-documents')).toBeInTheDocument();
  });
});