import React, { useState } from "react";
import "../styles/LoginForm.css";
import { useAuth } from "../hooks/useAuth.tsx";

const LoginPage = () => {
  const [state, setState] = useState({
    username: "",
    password: "",
  });
  const { handleLogin } = useAuth();

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await handleLogin(state.username, state.password);
  }

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      <h1 data-testid="cypress-Login-title">Login</h1>
      <div className="form-ui">
        <div className="fields">
          <label>Username</label>
          <input
            data-testid="cypress-Login-UserName-input"
            type="Text"
            className="form-control"
            id="username"
            name="username"
            value={state.username}
            placeholder="Enter a valid Username"
            onChange={(e) => {
              handleChange(e);
            }}
          />
        </div>

        <div className="fields">
          <label>Password</label>
          <input
            data-testid="cypress-Login-Password-input"
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={state.password}
            placeholder="Enter a valid password"
            onChange={(e) => {
              handleChange(e);
            }}
          />
        </div>

        <div className={"form-btn"}>
          <button
            data-testid="cypress-Login-btn"
            className="btn"
            type={"submit"}
          >
            Login
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginPage;
