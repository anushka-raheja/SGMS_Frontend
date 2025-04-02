const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

const axios = {
  create: jest.fn(() => mockAxiosInstance),
  ...mockAxiosInstance
};

export default axios; 