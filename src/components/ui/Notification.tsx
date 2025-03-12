import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface NotificationProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  position?: NotificationPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  position = 'top-right',
  action,
  onClose,
}) => {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const Icon = type === 'success' ? FaCheckCircle : FaExclamationCircle;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed w-96 ${bgColor} border ${borderColor} rounded-lg shadow-lg ${positionClasses[position]}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>{title}</p>
            <p className={`mt-1 text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={`text-sm font-medium ${
                    type === 'success' ? 'text-green-700 hover:text-green-600' : 'text-red-700 hover:text-red-600'
                  }`}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex ${textColor} hover:${type === 'success' ? 'text-green-600' : 'text-red-600'}`}
              onClick={onClose}
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification; 