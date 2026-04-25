import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageMotion } from '@/components/layout/PageMotion';
import { SettingsSection } from '@/components/layout/SettingsSection';

const TEAM_KEYS = ['member1', 'member2', 'member3'] as const;

export function AboutPage(): React.JSX.Element {
  const { t } = useTranslation('about');

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <PageMotion>
          <PageHeader title={t('title')} subtitle={t('subtitle')} />

          <SettingsSection
            id="mission-heading"
            title={t('mission.heading')}
            className="mt-12"
          >
            <p className="text-muted-foreground">{t('mission.body')}</p>
          </SettingsSection>

          <SettingsSection id="team-heading" title={t('team.heading')}>
            <ul className="grid gap-6 sm:grid-cols-3">
              {TEAM_KEYS.map((key) => (
                <li key={key} className="rounded-xl border border-border bg-muted/40 px-6 py-5">
                  <p className="font-medium text-foreground">{t(`team.${key}.name`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`team.${key}.role`)}</p>
                </li>
              ))}
            </ul>
          </SettingsSection>
        </PageMotion>
      </div>
    </PageLayout>
  );
}
