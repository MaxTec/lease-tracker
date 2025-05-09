import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations();
  const today = new Date().toLocaleDateString();

  // Get translation arrays with proper typing
  const personalInfoItems = t.raw('privacy.informationCollected.personalInfo.items') as string[];
  const usageDataItems = t.raw('privacy.informationCollected.usageData.items') as string[];
  const informationUseItems = t.raw('privacy.informationUse.items') as string[];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('privacy.title')}</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">{t('privacy.lastUpdated', { date: today })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy.introduction.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.introduction.p1')}
            </p>
            <p className="text-gray-700">
              {t('privacy.introduction.p2')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy.informationCollected.title')}</h2>
            <h3 className="text-xl font-medium mb-2">{t('privacy.informationCollected.personalInfo.title')}</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              {personalInfoItems.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xl font-medium mb-2">{t('privacy.informationCollected.usageData.title')}</h3>
            <p className="text-gray-700">
              {t('privacy.informationCollected.usageData.description')}
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              {usageDataItems.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy.informationUse.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.informationUse.description')}
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              {informationUseItems.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy.dataSecurity.title')}</h2>
            <p className="text-gray-700">
              {t('privacy.dataSecurity.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy.contactSection.title')}</h2>
            <p className="text-gray-700">
              {t('privacy.contactSection.description')}
            </p>
            <p className="text-gray-700 mt-2">
              {t('privacy.contactSection.email')}<br />
              {t('privacy.contactSection.address')}
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 