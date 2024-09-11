import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/pages.css';
import AlgoSwitch from '../components/switches/AlgoSwitch';
import EncryptButton from '../components/buttons/ProcessButton';

function Encrypt() {
  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-center h-full w-full'>
      <div className="relative h-full w-11/12 p-6">
        <button
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 flex items-center text-white hover:text-gray-400 transition-colors duration-300"
        >
          <MdArrowBackIosNew className="mr-2" />
          Back to Home
        </button>

        <div className="mt-16">
          <h1 className="text-3xl font-bold text-white">Encrypt a Video</h1>
          <h2 className="mt-6 text-sm font-semibold text-white">Choose an Encryption Algorithm</h2>
          <AlgoSwitch />
          <input type='text' placeholder='Enter file path or click the button' className='mt-4 w-full h-12 rounded-xl bg-primary-light'></input>
          <input type='text' placeholder='Enter a password' className='mt-4 w-full h-12 rounded-xl bg-primary-light'></input>
          <EncryptButton />
        </div>
      </div>
    </div>
  );
}

export default Encrypt;
