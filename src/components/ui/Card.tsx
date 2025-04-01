import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode[];
}

const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className='text-lg font-medium text-gray-800'>{title}</h3>
        {actions && (
          <div className="flex space-x-2">
            {actions.map((action, index) => (
              <div key={index} className="flex-1">
                {action}
              </div>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default Card; 