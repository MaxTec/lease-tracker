import { FC } from 'react';
import { FaHome, FaExclamationTriangle, FaFileContract, FaCalendarAlt, FaRegLightbulb, FaTrophy, FaChartBar, FaBullhorn, FaPiggyBank, FaRegEnvelope, FaRegCheckSquare, FaLaptop, FaQuestion, FaPercent, FaEuroSign, FaDollarSign, FaGavel, FaRegFileAlt, FaRegClock, FaRegCompass } from 'react-icons/fa';
import { MdWarning, MdGavel as MdGavelFilled } from 'react-icons/md';

const ICONS = [
  FaHome,
  FaExclamationTriangle,
  FaFileContract,
  FaCalendarAlt,
  FaRegLightbulb,
  FaTrophy,
  FaChartBar,
  FaBullhorn,
  FaPiggyBank,
  FaRegEnvelope,
  FaRegCheckSquare,
  FaLaptop,
  FaQuestion,
  FaPercent,
  FaEuroSign,
  FaDollarSign,
  FaGavel,
  MdWarning,
  MdGavelFilled,
  FaRegFileAlt,
  FaRegClock,
  FaRegCompass,
];

const COLORS = [
  'text-blue-400',
  'text-blue-500',
  'text-blue-600',
  'text-blue-700',
  'text-gray-400',
  'text-gray-500',
  'text-gray-600',
];

const EvictionPatternBackground: FC = () => {
  const icons = Array.from({ length: 40 }).map((_, i) => {
    const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.floor(Math.random() * 32) + 32; // 32px to 64px
    const top = Math.random() * 90; // percent
    const left = Math.random() * 90; // percent
    const rotate = Math.floor(Math.random() * 360); // degrees
    const opacity = 0.15 + Math.random() * 0.25; // 0.15 to 0.4
    return (
      <span
        key={i}
        className={`absolute pointer-events-none ${color}`}
        style={{
          top: `${top}%`,
          left: `${left}%`,
          transform: `rotate(${rotate}deg)` ,
          opacity,
          fontSize: `${size}px`,
        }}
        aria-hidden="true"
      >
        <Icon />
      </span>
    );
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {icons}
      <div className="absolute inset-0 bg-white/70" /> {/* semi-transparent overlay */}
    </div>
  );
};

export default EvictionPatternBackground; 