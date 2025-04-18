import { FaInbox } from 'react-icons/fa';
import Button from './Button';
import { useTranslations } from 'next-intl';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  translationPrefix?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = <FaInbox className="w-12 h-12" />,
  translationPrefix,
}: EmptyStateProps) {
  const t = useTranslations();
  
  // If translationPrefix is provided, use it to get translated text
  const displayTitle = translationPrefix ? t(`${translationPrefix}.title`) : title;
  const displayDescription = translationPrefix ? t(`${translationPrefix}.description`) : description;
  const displayActionLabel = translationPrefix && actionLabel 
    ? t(`${translationPrefix}.action`) 
    : actionLabel;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
        {displayDescription}
      </p>
      {displayActionLabel && onAction && (
        <Button onClick={onAction}>
          {displayActionLabel}
        </Button>
      )}
    </div>
  );
} 