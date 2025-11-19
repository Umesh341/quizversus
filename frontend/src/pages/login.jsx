import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import { loginUser, registerUser } from "../ApiHit/Db";
import { useAuthStore } from "../Store/authStore";

function Login() {
  const { loginUser } = useAuthStore();


  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(formData, navigate);
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center bg-blue-10 justify-center min-h-[85vh]">
      <div className="p-8 w-full max-w-md min-h-[400px]">
        <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Log in to Your Account
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Join us and start your journey today!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="mt-1 outline-none block w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-200 sm:text-sm"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle between "text" and "password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="mt-1 outline-none block w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-200 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-md font-medium text-white ${
              loading
                ? "bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;