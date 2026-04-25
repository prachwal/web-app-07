import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/notificationsSlice';
import { cn } from '@/lib/utils';

const buildSchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().min(2, t('validation.nameMin')),
    email: z.string().email(t('validation.emailInvalid')),
    message: z.string().min(10, t('validation.messageMin')),
  });

type ContactFormValues = z.infer<ReturnType<typeof buildSchema>>;

const inputClass = cn(
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
);

/**
 * Contact page with a validated form (React Hook Form + Zod).
 * On submit dispatches a success notification via Redux.
 *
 * @returns The contact page element
 */
export function ContactPage(): React.JSX.Element {
  const { t } = useTranslation('contact');
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(buildSchema(t)),
  });

  const onSubmit = async (_data: ContactFormValues): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600));
    dispatch(addNotification({ type: 'success', message: t('sent') }));
    reset();
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          noValidate
          className="mt-10 space-y-6"
          aria-label={t('title')}
        >
          <div>
            <label
              htmlFor="contact-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t('form.name')}
            </label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              placeholder={t('form.namePlaceholder')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              className={inputClass}
              {...register('name')}
            />
            {errors.name && (
              <p
                id="contact-name-error"
                role="alert"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t('form.email')}
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder={t('form.emailPlaceholder')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              className={inputClass}
              {...register('email')}
            />
            {errors.email && (
              <p
                id="contact-email-error"
                role="alert"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t('form.message')}
            </label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder={t('form.messagePlaceholder')}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className={cn(inputClass, 'resize-y')}
              {...register('message')}
            />
            {errors.message && (
              <p
                id="contact-message-error"
                role="alert"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {errors.message.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground',
              'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-opacity',
            )}
          >
            {isSubmitting ? t('form.submitting') : t('form.submit')}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
