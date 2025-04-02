import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalsDash from '../components/goalsdash';

// Mock axios
jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn()
}));

// Import the mocked axios
import axios from '../utils/axios';

describe('GoalsDash Component', () => {
  const mockGoals = [
    {
      _id: '1',
      title: 'Complete React Course',
      description: 'Finish all modules of the React course',
      deadline: '2023-12-31',
      progress: 60
    },
    {
      _id: '2',
      title: 'Learn Redux',
      description: 'Master Redux state management',
      deadline: '2023-11-30',
      progress: 30
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the initial goals fetch
    axios.get.mockResolvedValue({ data: mockGoals });
  });

  test('renders goal list and add goal button', async () => {
    render(<GoalsDash />);
    
    // Initially should show loading state or fetch goals
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/goals');
    });
    
    // Should display goals after fetching
    await waitFor(() => {
      expect(screen.getByText('Complete React Course')).toBeInTheDocument();
      expect(screen.getByText('Learn Redux')).toBeInTheDocument();
    });
    
    // Add Goal button should be visible
    expect(screen.getByText('Add New Goal')).toBeInTheDocument();
  });

  test('opens form when Add New Goal button is clicked', async () => {
    render(<GoalsDash />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Complete React Course')).toBeInTheDocument();
    });
    
    // Click the Add New Goal button
    fireEvent.click(screen.getByText('Add New Goal'));
    
    // Form should now be visible
    expect(screen.getByText('Goal Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Target Date')).toBeInTheDocument();
    expect(screen.getByText('Create Goal')).toBeInTheDocument();
  });

  test('allows adding a new goal', async () => {
    const newGoal = {
      _id: '3',
      title: 'Learn Jest',
      description: 'Master testing with Jest',
      deadline: '2023-10-31',
      progress: 0
    };
    
    axios.post.mockResolvedValue({ data: newGoal });
    
    render(<GoalsDash />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Add New Goal')).toBeInTheDocument();
    });
    
    // Click the Add New Goal button
    fireEvent.click(screen.getByText('Add New Goal'));
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Goal Title'), {
      target: { value: 'Learn Jest' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Master testing with Jest' }
    });
    
    fireEvent.change(screen.getByLabelText('Target Date'), {
      target: { value: '2023-10-31' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Goal'));
    
    // Should call the API with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/goals', {
        title: 'Learn Jest',
        description: 'Master testing with Jest',
        deadline: '2023-10-31'
      });
    });
  });
}); 