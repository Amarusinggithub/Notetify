import { useNavigate } from "react-router";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-row min-h-screen justify-center items-center">
        <button
          className="text-center text-white "
          onClick={() => {
            navigate("/login");
          }}
        >
          Login
        </button>
      </div>
    </>
  );
};

export default Landing;
