import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from '../utils/axios';
import GroupDocuments from '../components/groupdocuments';

const mockLocalStorage = {
  getItem: () => 'mock-token'
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

jest.mock('../utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('GroupDocuments Component', () => {
  const mockGroupId = '123';
  const mockDocuments = [{
    _id: '1',
    fileName: 'test.pdf',
    filePath: '/uploads/test.pdf',
    uploaderId: { name: 'John Doe' }
  }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    render(<GroupDocuments groupId={mockGroupId} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows documents after loading', async () => {
    axios.get.mockResolvedValue({ data: mockDocuments });
    
    render(<GroupDocuments groupId={mockGroupId} />);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('handles upload', async () => {
    axios.get.mockResolvedValue({ data: mockDocuments });
    axios.post.mockResolvedValue({ data: { message: 'success' } });
    
    const { container } = render(<GroupDocuments groupId={mockGroupId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    const fileInput = container.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, {
      target: { files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })] }
    });
    fireEvent.click(screen.getByText('Upload'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `/api/documents/${mockGroupId}/upload`,
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });

  it('shows error on upload failure', async () => {
    axios.get.mockResolvedValue({ data: mockDocuments });
    axios.post.mockRejectedValue({ response: { data: { message: 'Upload failed' } } });
    
    const { container } = render(<GroupDocuments groupId={mockGroupId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    const fileInput = container.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, {
      target: { files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })] }
    });
    fireEvent.click(screen.getByText('Upload'));
    
    await waitFor(() => {
      expect(screen.getByText('Error: Upload failed')).toBeInTheDocument();
    });
  });
}); 