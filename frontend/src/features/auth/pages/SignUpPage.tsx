import {useState} from "react";
import "../styles/SignUpForm.css";
import {useAuth} from "../hooks/useAuth.tsx";


const SignUpPage = () => {
    const [state, setState] = useState({
        email: '',
        password: '', confirmPassword: '', username: '',
    });

    const {handleSignup} = useAuth();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setState({ ...state, [e.target.name]: e.target.value });
    }


    async function handleSubmit(
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
      e.preventDefault();

      if (state.password !== state.confirmPassword) {
        console.log("Passwords do not match");
        return;
      }

      handleSignup(state.username, state.email, state.password);
    }


    return (
      <div className="container">
        <form>
          <h1>Sign Up</h1>
          <div className="form-ui">
            <div className="fields">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={state.username}
                placeholder="Enter a username"
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>
            <div className="fields">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={state.email}
                placeholder="Enter a valid email"
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>

            <div className="fields">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={state.password}
                placeholder="Enter a valid password"
                onChange={(e)=>{handleChange(e)}}
              />
            </div>

            <div className="fields">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={state.confirmPassword}
                placeholder="Confirm Password"
                               onChange={(e)=>{handleChange(e)}}
              />
            </div>

            <div className={"form-btn"}>
              <button className="btn" onClick={(e)=>{handleSubmit(e)}}>
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </div>
    );

};

export default SignUpPage;