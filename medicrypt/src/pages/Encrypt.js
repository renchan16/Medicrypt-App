import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowCircleLeft, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import '../pages-css/General.css';
import AlgorithmSelector from '../components/switches/AlgorithmSelector';
import FilePathInput from '../components/text input/FilePathInput';
import PasswordInput from '../components/text input/PasswordInput';
import ProcessButton from '../components/buttons/ProcessButton';
import { FaPaperclip, FaFolder } from "react-icons/fa6";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { RiKey2Fill } from "react-icons/ri";

function Encrypt() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const outputDirpathInputRef = useRef(null);
  const hashInputRef = useRef(null);

  const [algorithm, setAlgorithm] = useState("");
  const [filepaths, setFilePaths] = useState("");
  const [password, setPassword] = useState("");
  const [outputDirpath, setOutputDirpath] = useState("");
  const [hashPath, setHashPath] = useState("");
  const [isFilepathValid, setFilepathValidity] = useState(false);
  const [isPasswordValid, setPasswordValidity] = useState(false);
  const [isOutputDirpathValid, setOutputDirpathValidity] = useState(true);
  const [isHashPathValid, setHashPathValidity] = useState(true);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const processInputData = async () => {
    if (!showAdditionalFields) {
      fileInputRef.current.validate();
      outputDirpathInputRef.current.validate();

      if (isFilepathValid && isOutputDirpathValid) {
        setShowAdditionalFields(true);
      } else {
        console.log('Please fill in all required fields correctly.');
      }
    } else {
      passwordInputRef.current.validate();
      hashInputRef.current.validate();

      if (isPasswordValid && isHashPathValid) {
        navigate('/encrypt/processing', {
          state: {
            processType: 'Encrypt',
            inputs: { algorithm, filepaths, password, outputDirpath, hashPath }
          }
        });
      } else {
        console.log('Please fill in all required fields correctly.');
      }
    }
  };

  const showPreviousFields = () => {
    setShowAdditionalFields(false);
  };

  // Same animation variants as in Decrypt
  const variants = {
    initial: { opacity: 0, x: '-100%' }, // Start from left
    animate: { opacity: 1, x: 0 },       // End at center
    exit: { opacity: 0, x: '100%' }       // Exit to right
  };

  return (
    <motion.div
      className='flex items-center justify-center h-full w-full select-none'
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-full w-11/12 p-6 overflow-x-hidden">
        <button
          onClick={() => navigate('/')}
          className="absolute top-8 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
        >
          <FaArrowCircleLeft className="mr-2 text-secondary transition-transform duration-300 transform hover:-translate-x-2" />
        </button>

        <div className='relative top-1/2 transform -translate-y-1/2'>
          <h1 className="mb-3 text-4xl font-bold text-secondary font-avantGarde flex items-center">
            <RiKey2Fill className="mr-2 text-5xl" /> 
            Encrypt a Video
          </h1>
          <AlgorithmSelector
            className='mt-4 mb-4'
            componentHeader="Choose an Algorithm for Encryption"
            optionOne="FY-Logistic"
            optionTwo="3D-Cosine"
            onValueChange={setAlgorithm}
          />
          <div className={`flex h-2/6 mb-8 transition-transform duration-500 ease-in-out transform ${showAdditionalFields ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pr-8' : 'pr-0'}`}>
              <div className='space-y-4'>
                <FilePathInput
                  ref={fileInputRef}
                  componentHeader="Video File*"
                  placeholderText="C:\Users\YourUsername\Documents\video.mp4..."
                  defaultDisplayText="Enter a valid video file path."
                  browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45" />}
                  browseHandler={window.electron.openFilePath}
                  onValueChange={setFilePaths}
                  onValidityChange={setFilepathValidity}
                  allowMultiple={true}
                  isRequired={true}
                  isEnabled={showAdditionalFields ? false : true}
                />
                <FilePathInput
                  ref={outputDirpathInputRef}
                  componentHeader="Encrypted Video File Destination"
                  placeholderText="C:\Users\YourUsername\Documents\EncryptedVideoDest..."
                  defaultDisplayText="Enter a valid directory path."
                  browseIcon={<FaFolder className="w-3/4 h-3/4 transform " />}
                  browseHandler={window.electron.openFolder}
                  onValueChange={setOutputDirpath}
                  onValidityChange={setOutputDirpathValidity}
                  isRequired={false}
                  isEnabled={showAdditionalFields ? false : true}
                />
              </div>
            </div>
            <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pl-0' : 'pl-8'}`}>
              <div className='space-y-4'>
                <PasswordInput
                  ref={passwordInputRef}
                  componentHeader="Hash Key Password*"
                  placeholderText="e.g. ILoveM3d!Crypt143"
                  defaultDisplayText="Enter a password with at least 8 characters, an Uppercase Letter, a Lowercase Letter, a Digit, and a Special Character."
                  processType="Encrypt"
                  onValueChange={setPassword}
                  onValidityChange={setPasswordValidity}
                  isEnabled={showAdditionalFields ? true : false}
                />
                <FilePathInput
                  ref={hashInputRef}
                  componentHeader="Hash Key File Destination"
                  placeholderText="C:\Users\YourUsername\Documents\HashFolder..."
                  defaultDisplayText="Enter a valid directory path."
                  browseIcon={<FaFolder className="w-3/4 h-3/4 transform " />}
                  browseHandler={window.electron.openFolder}
                  onValueChange={setHashPath}
                  onValidityChange={setHashPathValidity}
                  isRequired={false}
                  isEnabled={showAdditionalFields ? true : false}
                />
              </div>
            </div>
          </div>
          <div className='flex justify-between'>
            <ProcessButton
              className={`w-40 h-14`}
              buttonText="Prev"
              buttonIcon={FaChevronCircleLeft}
              iconLocation='left'
              isEnabled={showAdditionalFields ? true : false}
              onClickFunction={showPreviousFields}
            />
            <ProcessButton
              className={`w-40 h-14`}
              buttonText={`${showAdditionalFields ? "Encrypt" : "Next"}`}
              buttonIcon={showAdditionalFields ? FaLock : FaChevronCircleRight}
              iconLocation={showAdditionalFields ? 'left' : 'left'}
              onClickFunction={processInputData}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Encrypt;
