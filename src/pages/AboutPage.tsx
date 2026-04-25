import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { PageLayout } from '@/components/layout/PageLayout';

const TEAM_KEYS = ['member1', 'member2', 'member3'] as const;

/**
 * About page — displays the team mission and member cards.
 *
 * @returns The about page element
 */
export function AboutPage(): React.JSX.Element {
  const { t } = useTranslation('about');
  const reducedMotion = useReducedMotion();

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>

          <section aria-labelledby="mission-heading" className="mt-12">
            <h2 id="mission-heading" className="text-2xl font-semibold text-foreground">
              {t('mission.heading')}
            </h2>
            <p className="mt-4 text-muted-foreground">{t('mission.body')}</p>
          </section>

          <section aria-labelledby="team-heading" className="mt-12">
            <h2 id="team-heading" className="text-2xl font-semibold text-foreground">
              {t('team.heading')}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-3">
              {TEAM_KEYS.map((key) => (
                <li key={key} className="rounded-xl border border-border bg-muted/40 px-6 py-5">
                  <p className="font-medium text-foreground">{t(`team.${key}.name`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`team.${key}.role`)}</p>
                </li>
              ))}
            </ul>
          </section>
        </motion.div>
      </div>
    </PageLayout>
  );
}
