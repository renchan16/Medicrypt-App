import React, { useState } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/General.css';
import AlgoSwitch from '../components/switches/AlgoSwitch';
import FileInput from '../components/text input/FileInput';
import PasswordInput from '../components/text input/PasswordInput';
import EncryptButton from '../components/buttons/ProcessButton';
import BackgroundImage from '../assets/background.png';

function Encrypt() {
  const navigate = useNavigate();
  const [algorithm, setAlgorithm] = useState("");
  const [videofile, setVideoFile] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    console.log(algorithm);
    console.log(videofile);
    console.log(password);
  }

  return (
    <div className='flex items-center justify-center h-full w-full'>
      <div className="relative h-full w-11/12 p-6">
        <button
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
          >
          <MdArrowBackIosNew className="mr-2" />
        </button>

        <div className="grid grid-cols-3 grid-rows-5 gap-4 auto-rows-auto mt-16">
          <h1 className="col-span-3 text-3xl font-bold text-primary1 flex items-center">Encrypt a Video</h1>
          <AlgoSwitch className="col-span-3" onAlgorithmChange={setAlgorithm}/>
          <FileInput className="col-span-3" placeholder="Choose a file" onFileChange={setVideoFile}/>
          <PasswordInput className="col-span-3" onPasswordChange={setPassword}/>
          <EncryptButton onClickFunction={handleSubmit}/>
        </div>
      </div>
    </div>
  );
}

export default Encrypt;
