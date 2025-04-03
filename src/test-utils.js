import React, { act } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that explicitly uses React.act
function render(ui, options) {
  let result;
  act(() => {
    result = rtlRender(ui, options);
  });
  return result;
}

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

// Re-export everything from testing-library but use our custom render
export * from '@testing-library/react';
export { render }; 