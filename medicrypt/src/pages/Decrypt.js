import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 
import AlgoSwitch from '../components/switches/AlgoSwitch';
import FileInput from '../components/text input/FilePathInput';
import PasswordInput from '../components/text input/PasswordInput';
import EncryptButton from '../components/buttons/ProcessButton';

function Decrypt() {
  const navigate = useNavigate(); 

  return (
    <div className='flex items-center justify-center h-full w-full'>
      <div className="relative h-full w-11/12 p-6">
        <button
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
          >
          <MdArrowBackIosNew className="mr-2" />
        </button>

        <div className="grid grid-cols-3 grid-rows-6 gap-y-4 mt-16">
          <h1 className="col-span-3 text-3xl font-bold text-primary1 flex items-center">Decrypt a Video</h1>
          
        </div>
      </div>
    </div>
  );
}

export default Decrypt;
