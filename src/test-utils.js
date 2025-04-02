import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes router with future flags enabled
export function renderWithRouter(ui, options) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {children}
      </BrowserRouter>
    ),
    ...options,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react'; 