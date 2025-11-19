import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";
const Navbar = () => {
  const {user, logoutUser} = useAuthStore();
  return (
  <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b-1 border-gray-200  sm:px-6 lg:px-8">
    <div className="wrapper mx-auto max-w-5xl  flex items-center justify-between h-[57px] ">
      <div className="text-[23px] font-bold">Quiz Versus</div>

<div className="wrapper flex items-center gap-6 justify-between ">
          <Link to="/" className="font-medium  hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700 ">
            Home
          </Link>
     
          <Link to="/about" className="font-medium hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700 ">
            About
          </Link>
 {user ?(
  <>
          <Link to="/play" className="font-medium  hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700 ">
            Play
          </Link>
           <Link to="/profile" className="font-medium  hover:translate-y-[-2px] transition duration-300 ease-in-out hover:text-blue-700 ">
          Profile
          </Link>
          <button onClick={logoutUser} className="hidden md:flex cursor-pointer  px-4 py-2 gap-2 items-center bg-gradient-to-r from-blue-700 to-blue-600 opacity-80 text-white rounded-md transition duration-300 ease-in-out  hover:to-blue-700 hover:text-bold ">
  <span className="text-md font-semibold mb-[1px]">
    Logout
  </span>
  </button>

          </>
          ):(
  <Link to="/login" className="hidden md:flex cursor-pointer  px-4 py-2 gap-2 items-center bg-gradient-to-r from-blue-700 to-blue-600 opacity-80 text-white rounded-md transition duration-300 ease-in-out  hover:to-blue-700 hover:text-bold ">
  <span className="text-md font-semibold mb-[1px]">
    Login / Signup
  </span>
  </Link>
          )}


  
        
       
    
     </div>
   
    </div>
  </nav>
);
};

export default Navbar;
