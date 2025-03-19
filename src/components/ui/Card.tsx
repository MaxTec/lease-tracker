import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className='text-lg font-medium text-gray-800 mb-3'>{title}</h3>
      {children}
    </div>
  );
};

export default Card; 