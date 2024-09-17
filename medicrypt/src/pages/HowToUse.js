import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function HowToUse() {
  const navigate = useNavigate();
  return (
    <div className="relative h-full p-6">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
      >
        <MdArrowBackIosNew className="mr-2" />
      </button>

      <div className="mt-4 text-center">
        <h1 className="text-3xl font-bold text-white">How to Use</h1>
        <p className="text-white mt-4">Instructions on how to use the app.</p>
      </div>
    </div>
  );
}

export default HowToUse;
