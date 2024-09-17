import React from 'react';

const Card = ({ width = 'w-full', height = 'h-full', children }) => {
  return (
    <div
      className={`rounded-[18px] ${width} ${height}`}
      style={{ minWidth: '200px', minHeight: '150px' }}
    >
      {children}
    </div>
  );
};

export default Card;
