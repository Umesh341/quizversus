import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Play from './pages/Play';
import Signup from './pages/Signup';
import Verify from './pages/verify';
import Login from './pages/login';
import Profile from './pages/Profile';
import { useAuthStore } from './Store/authStore';
import PlayGround from './pages/PlayGround';

const App = () => {


  return (
    <Router>
      <MainApp />
    </Router>
  );
};

const MainApp = () => {
    const { checkAuth , user } = useAuthStore();
  
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  const location = useLocation(); // Now useLocation is inside the Router context
  const hideNavbarRoutes = ['/signup', '/verify/:email'];

  // Check if the current route matches any of the routes where the Navbar should be hidden
  const shouldHideNavbar = hideNavbarRoutes.some((route) => location.pathname.startsWith(route));

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <div className=" ">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/play" element={user ? <PlayGround /> : <Login s/>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={ user ? <Profile /> : <Login />} />
          <Route path="/verify/:email" element={<Verify />} />
        </Routes>
      </div>
    </>
  );
};

export default App;