import { ReactNode } from "react";

interface DescriptionItemProps {
  label: string;
  children: ReactNode;
  span?: number;
}

interface DescriptionsProps {
  title?: string;
  items: DescriptionItemProps[];
  bordered?: boolean;
  column?: number;
  layout?: "horizontal" | "vertical";
  className?: string;
}

const DescriptionItem = ({ label, children }: DescriptionItemProps) => {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="text-gray-900">{children}</div>
    </div>
  );
};

const Descriptions = ({
  title,
  items,
  bordered = false,
  column = 1,
  className = "",
}: Omit<DescriptionsProps, "layout">) => {
  const columnClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
  };
  return (
    <div
      className={`w-full ${
        bordered ? "border border-gray-200 rounded-lg" : ""
      } ${className}`}
    >
      {title && (
        <div
          className={`${
            bordered ? "px-4 py-2 border-b border-gray-200" : "mb-1.5"
          }`}
        >
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div
        className={`${bordered ? "p-6" : ""} grid grid-cols-1 ${
          columnClass[column as keyof typeof columnClass]
        } gap-3`}
      >
        {items.map((item, index) => (
          <DescriptionItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Descriptions;
