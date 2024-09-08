import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPage from '../src/pages/LandingPage';  // Adjust the path according to your file structure

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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <LandingPage />
    </div>
  );
}

export default App;
