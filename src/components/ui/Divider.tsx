"use client";

import { ReactNode } from "react";

interface DividerProps {
  title: string;
  actions?: ReactNode;
  orientation?: "horizontal" | "vertical";
  lineStyle?: "solid" | "dotted" | "dashed";
  children: ReactNode;
}

export default function Divider({
  title,
  actions,
  orientation = "horizontal",
  lineStyle = "solid",
  children
}: DividerProps) {
  const lineStyles = {
    solid: "border-gray-200",
    dotted: "border-dotted border-gray-200",
    dashed: "border-dashed border-gray-200"
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 lg:space-y-0">
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900 whitespace-nowrap">{title}</h3>
          <div className={`flex-grow border-b ${lineStyles[lineStyle]} my-2 mx-3`} />
          {actions && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className={orientation === "horizontal" ? "space-y-4" : "space-x-4 flex items-center"}>
        {children}
      </div>
    </div>
  );
} 