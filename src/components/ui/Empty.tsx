"use client";

import { FiAlertCircle } from "react-icons/fi";
import Button from "./Button";

interface EmptyProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Empty({ 
  title, 
  description, 
  icon = <FiAlertCircle className="w-8 h-8 text-yellow-500" />,
  action 
}: EmptyProps) {
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        {icon}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-yellow-800">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-yellow-600">
              {description}
            </p>
          )}
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
} 