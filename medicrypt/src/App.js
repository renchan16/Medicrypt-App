import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import LandingPage from './pages/LandingPage';  
import Decrypt from './pages/Decrypt';
import Encrypt from './pages/Encrypt';
import Explore from './pages/Explore';
import HowToUse from './pages/HowToUse';
import ProcessingPage from './pages/ProcessingPage';
import EvaluateEncrypt from './pages/EvaluateEncrypt';
import EvaluateDecrypt from './pages/EvaluateDecrypt';
import EvaluatingPage from './pages/EvaluatingPage';
import ResultsPage from './pages/ResultsPage';
import { PropagateLoader } from 'react-spinners'; // Import the loader

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); // State for loading spinner
  const [dots, setDots] = useState(''); // State for trailing dots in "Loading..."

  // Simulate loading text ellipsis effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/')
      .then(response => {
        setMessage(response.data.message);
        setLoading(false); // Stop loading once the data is fetched
      })
      .catch(error => {
        console.error("There was an error!", error);
        setLoading(false); // Stop loading even if there's an error
      });
  }, []);

  return (
    <Router>
      <div className="h-screen flex flex-col justify-center items-center">
        {/* Show spinner while loading */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <PropagateLoader color="#1D1B20" loading={loading} size={15} />
            <p className="mt-10 text-xl font-bold text-black">
              Loading{dots}
            </p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/encrypt" element={<Encrypt />} />
            <Route path="/decrypt" element={<Decrypt />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/howtouse" element={<HowToUse />} />
            <Route path="/encrypt/processing" element={<ProcessingPage />} />
            <Route path="/decrypt/processing" element={<ProcessingPage />} />
            <Route path="/encrypt/evaluate" element={<EvaluateEncrypt />} />
            <Route path="/decrypt/evaluate" element={<EvaluateDecrypt />} />
            <Route path="/encrypt/evaluating" element={<EvaluatingPage />} />
            <Route path="/decrypt/evaluating" element={<EvaluatingPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
