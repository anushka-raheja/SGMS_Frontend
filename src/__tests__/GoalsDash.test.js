import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GoalsDash from '../components/goalsdash';

jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn()
}));

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
    axios.get.mockResolvedValue({ data: mockGoals });
  });

  test('renders goal list and add goal button', async () => {
    await act(async () => {
      render(<GoalsDash />);
    });
    
    expect(axios.get).toHaveBeenCalledWith('/api/goals');
    
    expect(screen.getByText('Complete React Course')).toBeInTheDocument();
    expect(screen.getByText('Learn Redux')).toBeInTheDocument();
    
    expect(screen.getByText('Add New Goal')).toBeInTheDocument();
  });

  test('opens form when Add New Goal button is clicked', async () => {
    await act(async () => {
      render(<GoalsDash />);
    });
    
    expect(screen.getByText('Complete React Course')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(screen.getByText('Add New Goal'));
    });
    
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
    
    await act(async () => {
      render(<GoalsDash />);
    });
    
    expect(screen.getByText('Add New Goal')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(screen.getByText('Add New Goal'));
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Goal Title'), {
        target: { value: 'Learn Jest' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Master testing with Jest' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Target Date'), {
        target: { value: '2023-10-31' }
      });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Create Goal'));
    });
    
    expect(axios.post).toHaveBeenCalledWith('/api/goals', {
      title: 'Learn Jest',
      description: 'Master testing with Jest',
      deadline: '2023-10-31'
    });
  });
}); 