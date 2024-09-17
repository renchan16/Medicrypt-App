import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 
import AlgoSwitch from '../components/switches/AlgoSwitch';
import FileInput from '../components/text input/FileInput';
import PasswordInput from '../components/text input/PasswordInput';
import EncryptButton from '../components/buttons/ProcessButton';

function Decrypt() {
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

        <div className="grid grid-cols-3 grid-rows-6 gap-y-4 mt-16">
          <h1 className="col-span-3 h-12 text-3xl font-bold text-white">Decrypt a Video</h1>
          
        </div>
      </div>
    </div>
  );
}

export default Decrypt;