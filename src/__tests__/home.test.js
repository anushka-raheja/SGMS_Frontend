import React, { act } from 'react';
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';
import Home from "../components/home";

test("renders Home component correctly", () => {
  render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
  
  expect(screen.getByText(/Welcome to SGMS/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
});
