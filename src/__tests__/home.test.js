import React from 'react';
import { renderWithRouter, screen } from "../test-utils";
import "@testing-library/jest-dom";
import Home from "../components/home";

test("renders Home component correctly", () => {
  renderWithRouter(<Home />);
  
  expect(screen.getByText(/Welcome to SGMS/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
});
