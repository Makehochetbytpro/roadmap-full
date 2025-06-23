import { useState } from 'react'
import './App.css'
import Login from './code/registration/Login.jsx'
import SignUp from './code/registration/SignUp.jsx'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './code/header/Header.jsx';
import MainPage from './code/mainPage/MainPage.jsx';
import RoadmapPage from './code/roadmapPage/RoadmapPage.jsx';
import AboutUsPage from './code/aboutUs/AboutUsPage.jsx';
import Material from './code/material/Material.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import ScrollToTop from './code/ScrollToTop.jsx';
import CategoryProgramming from './code/categories/CategoryProgramming.jsx';
// import { Desktop } from './code/mainPage/Desktop.jsx';

function App() {
  return (
    <>
      <Router>
          <ScrollToTop />
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/header" element={<Header />} />
              <Route path="/" element={<MainPage />} />
              <Route path="/topic" element={<RoadmapPage />} />
              <Route path="/aboutus" element={<AboutUsPage />} />
              <Route path="/subtopic" element={<Material />} />
              <Route path="/category/programming" element={<CategoryProgramming />} />
              {/* <Route path="/desktop" element={<Desktop />} /> */}
          </Routes>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
