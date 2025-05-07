import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode[];
  showShadow?: boolean;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '', actions, showShadow = true }) => {
  return (
    <div
      className={`bg-white rounded-lg p-6 border border-gray-200 ${showShadow ? ' shadow-lg' : ''} ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className='text-lg font-medium text-gray-800'>{title}</h3>
        </div>
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