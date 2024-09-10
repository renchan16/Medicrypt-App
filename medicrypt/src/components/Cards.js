import React from 'react';

const Card = ({ width = 'w-full', height = 'h-auto', children }) => {
  return (
    <div className={`rounded-[18px] ${width} ${height}`}>
      {children}
    </div>
  );
};

export default Card;
