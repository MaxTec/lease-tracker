"use client";

import { FaCheck } from "react-icons/fa";

interface Step {
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function StepIndicator({ steps, currentStep, className = "" }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => {
          const isCurrentStep = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <li key={step.title} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4
                  ${
                    isCompleted
                      ? "border-indigo-600"
                      : isCurrentStep
                      ? "border-indigo-600"
                      : "border-gray-200"
                  }`}
              >
                <span
                  className={`text-sm font-medium
                    ${
                      isCompleted
                        ? "text-indigo-600"
                        : isCurrentStep
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }`}
                >
                  {/* Step number or check icon */}
                  <span className="flex items-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full mr-2">
                      {isCompleted ? (
                        <FaCheck className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      ) : (
                        <span
                          className={`text-sm ${
                            isCurrentStep ? "text-indigo-600" : "text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </span>
                    {step.title}
                  </span>
                </span>
                <span
                  className={`text-sm
                    ${
                      isCompleted || isCurrentStep
                        ? "text-gray-600"
                        : "text-gray-500"
                    }`}
                >
                  {step.description}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 