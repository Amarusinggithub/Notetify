// LoginPage.tsx
import React, { useState } from "react";
import "../styles/LoginForm.css";
import { useAuth } from "../hooks/useAuth.tsx";
import { Link } from "react-router-dom";


const LoginPage = () => {
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const { handleLogin } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin(state.email, state.password);
  };

  return (
    <div className="login-container">
      <form
        className="login-form"
        data-testid="cypress-Login-form"
        onSubmit={handleSubmit}
      >
        <h1 data-testid="cypress-Login-title">Login</h1>
        <div className="form-ui">
          <div className="fields">
            <label className="labels">Email</label>
            <input
              data-testid="cypress-Login-Email-input"
              type="email"
              className="form-control"
              name="email"
              value={state.email}
              placeholder="Enter a valid email"
              onChange={handleChange}
            />
          </div>

          <div className="fields">
            <label className="labels">Password</label>
            <input
              data-testid="cypress-Login-Password-input"
              type="password"
              className="form-control"
              name="password"
              value={state.password}
              placeholder="Enter your password"
              onChange={handleChange}
            />
          </div>

          <button
            data-testid="cypress-Login-btn"
            className="form-btn"
            type="submit"
          >
            Login
          </button>

          <div>
            <span className="no-account">Dont have an Account? </span>
            <Link to="/signUp">Sign Up</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
