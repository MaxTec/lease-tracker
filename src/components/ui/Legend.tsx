'use client';

interface LegendItem {
  label: string;
  color: string; // Tailwind CSS color class
}

interface LegendProps {
  items: LegendItem[];
}

export default function Legend({ items }: LegendProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-md mb-4">
      <h4 className="font-semibold mb-2">Legend</h4>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className={`flex items-center`}>
            <span className={`w-4 h-4 rounded-full ${item.color} mr-2`} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 