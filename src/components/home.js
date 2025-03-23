import React from "react";
import { Link } from "react-router-dom";
// import styles from "./Home.module.css";
import "../App.css"

const Home = () => {
  return (
    <div>
      <h1>Welcome to SGMS</h1>
      <Link to="/signup">Sign Up</Link> | <Link to="/signin">Sign In</Link>
    </div>
  );
};

export default Home;
