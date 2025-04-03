import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import StudySessions from '../components/studysessions';
import axios from '../utils/axios';

// Mock axios
jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

describe('Study Sessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays study sessions when data is loaded', async () => {
    // Create a simple mock session in the format expected by the component
    const mockSessions = [
      {
        _id: 'session1',
        title: 'Math Study Session',
        subject: 'Mathematics',
        description: 'Study for math exam',
        date: '2023-06-15',
        startTime: '14:00',
        endTime: '15:00'
      }
    ];
    
    // Mock the API response
    axios.get.mockResolvedValue({ data: mockSessions });
    
    // Render the component
    renderWithRouter(<StudySessions />);
    
    // Verify the API call was made
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/study-sessions');
    });
    
    // Check if session title appears in the document
    await waitFor(() => {
      expect(screen.getByText('Math Study Session')).toBeInTheDocument();
    });
    
    // Check that a few basic session details are displayed
    expect(screen.getByText('Study for math exam')).toBeInTheDocument();
    expect(screen.getByText(/Time: 14:00 - 15:00/)).toBeInTheDocument();
  });

  it('displays a message when no sessions are available', async () => {
    // Mock empty API response
    axios.get.mockResolvedValue({ data: [] });
    
    // Render the component
    renderWithRouter(<StudySessions />);
    
    // Verify the API call was made
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/study-sessions');
    });
    
    // Check for the "no sessions" message
    await waitFor(() => {
      expect(screen.getByText('No study sessions scheduled. Add your first session to get started!')).toBeInTheDocument();
    });
    
    // Verify the "Add New Study Session" button is present
    expect(screen.getByText('Add New Study Session')).toBeInTheDocument();
  });
}); 