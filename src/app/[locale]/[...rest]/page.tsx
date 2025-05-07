import { notFound } from 'next/navigation';
import type { FC } from 'react';

const CatchAllPage: FC = () => {
  notFound();
  return null;
};

export default CatchAllPage; 