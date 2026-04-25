import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, useReducedMotion } from 'motion/react';
import { ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const emailSchema = z.object({
  email: z.string().min(1, 'hero:emailForm.error.required').email('hero:emailForm.error.invalid'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

/**
 * Hero call-to-action section with CTA buttons and email signup form.
 * Uses React Hook Form + Zod for validation with accessible error messages.
 *
 * @returns The hero actions element
 */
export function HeroActions(): React.JSX.Element {
  const { t } = useTranslation(['common', 'hero']);
  const shouldReduce = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (_data: EmailFormValues): Promise<void> => {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    setSubmitted(true);
  };

  const containerVariants = {
    hidden: shouldReduce ? {} : { opacity: 0, y: 20 },
    visible: shouldReduce
      ? {}
      : { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3, ease: 'easeOut' as const } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Primary CTA buttons */}
      <div className="flex flex-wrap gap-3">
        <a
          href="#get-started"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg',
            'bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground',
            'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'transition-opacity',
          )}
        >
          {t('hero:cta.primary')}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border border-border',
            'bg-background px-6 py-3 text-sm font-semibold text-foreground',
            'hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'transition-colors',
          )}
        >
          <ExternalLink size={16} aria-hidden="true" />
          {t('hero:cta.secondary')}
        </a>
      </div>

      {/* Email signup form */}
      <div className="max-w-md">
        {submitted ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground"
          >
            {t('hero:emailForm.success')}
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
            noValidate
            aria-label="Email notification signup"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="hero-email"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  {t('hero:emailForm.label')}
                </label>
                <input
                  id="hero-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('hero:emailForm.placeholder')}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'hero-email-error' : undefined}
                  className={cn(
                    'w-full rounded-lg border border-input bg-background px-3 py-2',
                    'text-sm text-foreground placeholder:text-muted-foreground',
                    'focus:outline-2 focus:outline-offset-2 focus:outline-ring',
                    errors.email && 'border-destructive',
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p
                    id="hero-email-error"
                    role="alert"
                    aria-live="assertive"
                    className="mt-1 text-xs text-destructive"
                  >
                    {t(errors.email.message as string)}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className={cn(
                  'self-end rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                  'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  'disabled:cursor-not-allowed disabled:opacity-50 transition-opacity',
                  'flex items-center gap-2',
                )}
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                {t('hero:emailForm.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
