import { useNavigate } from 'react-router';

const Landing = () => {
	const navigate = useNavigate();

	return (
		<>
			<div className="flex min-h-screen flex-row items-center justify-center">
				<button
					className="text-center text-white"
					onClick={() => {
						navigate('/login');
					}}
				>
					Login
				</button>
			</div>
		</>
	);
};

export default Landing;
