import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLightBulb } from "react-icons/hi";

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

      <div className="mt-4 text-left">
        <h1 className="text-3xl font-bold text-black mt-10 ml-7 flex items-center">
          <HiOutlineLightBulb className="mr-2 text-5xl" />
           Instructions
        </h1>
        <p className="text-black mt-4 ml-7 mr-7 text-justify">
          Lorem ipsum odor amet, consectetuer adipiscing elit. Ultrices conubia hac curabitur neque potenti. Maximus tempus maecenas aenean natoque gravida. Sociosqu urna nunc nisl dictum nam donec. Ornare dis eget curae, ultricies aenean volutpat. Risus aenean proin cubilia justo erat metus felis. Eros amet donec mus nec libero nostra ad libero. Quis est penatibus egestas adipiscing interdum. Ullamcorper fusce montes euismod scelerisque vel id litora. Pellentesque lacus felis efficitur magna magnis fusce nunc. Curabitur id dui risus dictum montes feugiat eros. Amet malesuada sem commodo potenti aptent fringilla montes. Orci ullamcorper integer vehicula efficitur sem viverra sed. Lorem ipsum odor amet, consectetuer adipiscing elit. Ultrices conubia hac curabitur neque potenti. Maximus tempus maecenas aenean natoque gravida. Sociosqu urna nunc nisl dictum nam donec. Ornare dis eget curae, ultricies aenean volutpat. Risus aenean proin cubilia justo erat metus felis. Eros amet donec mus nec libero nostra ad libero. Quis est penatibus egestas adipiscing interdum. Ullamcorper fusce montes euismod scelerisque vel id litora. Pellentesque lacus felis efficitur magna magnis fusce nunc. Curabitur id dui risus dictum montes feugiat eros. Amet malesuada sem commodo potenti aptent fringilla montes. Orci ullamcorper integer vehicula efficitur sem viverra sed.
        </p> 
      </div>
    </div>
  );
}

export default HowToUse;
