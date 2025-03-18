'use client';

interface FieldsetProps {
  legend: string;
  children: React.ReactNode;
}

export default function Fieldset({ legend, children }: FieldsetProps) {
  return (
    <fieldset className="border p-4 rounded-md mb-4">
      <legend className="font-semibold mx-1 px-2">{legend}</legend>
      {children}
    </fieldset>
  );
} 