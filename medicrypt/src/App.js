import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import LandingPage from './pages/LandingPage';  
import Decrypt from './pages/Decrypt';
import Encrypt from './pages/Encrypt';
import Explore from './pages/Explore';
import HowToUse from './pages/HowToUse';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error("There was an error!", error);
      });
  }, []);

  return (
    <Router>
      <div className="h-screen bg-primary">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/decrypt" element={<Decrypt />} />
          <Route path="/encrypt" element={<Encrypt />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/howtouse" element={<HowToUse />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
