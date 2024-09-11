import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/pages.css';
import AlgoSwitch from '../components/switches/AlgoSwitch';

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
        <h2 className="mt-6 text-xs font-semibold text-white">Choose an Encryption Algorithm</h2>
        <AlgoSwitch />
        <input type='text' placeholder='Enter file path or click the button' className='mt-8 w-96 h-12 rounded-lg'></input>
        <input type='text' placeholder='Enter a password' className='mt-4 w-96 h-12 rounded-lg'></input>
      </div>
    </div>
  );
}

export default Encrypt;
