import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.tsx';
import '../../styles/SignUpForm.css';
import { CreateUser } from '../../types/index.ts';

const Register = () => {
	const navigate = useNavigate();
	const [state, setState] = useState<CreateUser>({
		email: '',
		password: '',
		first_name: '',
		last_name: '',
	});

	const [confirmPassword, setConfirmPassword] = useState<string>('');

	const { handleSignup, isLoading } = useAuth();

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setState({ ...state, [e.target.name]: e.target.value.trim() });
	}

	async function handleSubmit(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) {
		e.preventDefault();

		if (state.password !== confirmPassword) {
			console.log('Passwords do not match');
			return;
		}

		await handleSignup(state);
	}

	return (
		<div className="signup-container">
			<form className="signup-form">
				<h1>Sign Up</h1>

				<div className="form-ui">
					<div className="fields">
						<label>First Name</label>
						<input
							type="text"
							className="form-control"
							id="firstname"
							name="firstname"
							value={state.first_name}
							placeholder="Enter a first name"
							onChange={(e) => {
								handleChange(e);
							}}
						/>
					</div>
					<div className="fields">
						<label>Last Name</label>
						<input
							type="text"
							className="form-control"
							id="lastname"
							name="lasname"
							value={state.last_name}
							placeholder="Enter a last name"
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
							onChange={(e) => {
								handleChange(e);
							}}
						/>
					</div>

					<div className="fields">
						<label>Confirm Password</label>
						<input
							type="password"
							className="form-control"
							id="confirmPassword"
							name="confirmPassword"
							value={confirmPassword}
							placeholder="Confirm Password"
							onChange={(e) => {
								setConfirmPassword(e.target.value.trim());
							}}
						/>
					</div>

					<button
						disabled={isLoading}
						className={'form-btn'}
						onClick={(e) => {
							handleSubmit(e);
						}}
					>
						Sign Up
					</button>

					<div>
						<span className="no-account">Already have an Account? </span>
						<Link to="/login">Login</Link>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Register;
