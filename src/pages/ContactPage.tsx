/**
 * @file src/pages/ContactPage.tsx
 * Contact page — two-column layout: form (left) + info panel (right).
 */

import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfo } from '@/components/contact/ContactInfo';

export function ContactPage(): React.JSX.Element {
  const { t } = useTranslation('contact');

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_18rem]">
          {/* Form — primary column */}
          <ContactForm />

          {/* Info panel — secondary column (stacks below on mobile) */}
          <ContactInfo />
        </div>
      </div>
    </PageLayout>
  );
}
