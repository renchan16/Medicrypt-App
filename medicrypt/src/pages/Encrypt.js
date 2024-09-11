import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/pages.css';

function Encrypt() {
  const navigate = useNavigate();

  return (
    <div className="relative h-full p-6">
      <button
        onClick={() => navigate('/')} 
        className="absolute top-4 left-4 flex items-center text-white hover:text-gray-400 transition-colors duration-300"
      >
        <MdArrowBackIosNew className="mr-2" />
        Back to Home
      </button>

      <div className="mt-16">
        <h1 className="text-3xl font-bold text-white">Encrypt a Video</h1>
        <h2 className="mt-6 text-sm font-normal text-white">Choose an Encryption Algorithm</h2>
      </div>
    </div>
  );
}

export default Encrypt;
