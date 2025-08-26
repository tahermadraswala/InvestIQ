import React from 'react';

const Card = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default Card;