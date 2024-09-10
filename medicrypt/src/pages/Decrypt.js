import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 

function Decrypt() {
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

      <div className="mt-4 text-center">
        <h1 className="text-3xl font-bold text-white">Decrypt</h1>
        <p className="text-white mt-4">Here you can decrypt your files.</p>
      </div>
    </div>
  );
}

export default Decrypt;
