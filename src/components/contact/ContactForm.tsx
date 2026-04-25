/**
 * @file src/components/contact/ContactForm.tsx
 *
 * Self-contained contact form component.
 * - react-hook-form + zod (schema built from shared CONTACT_LIMITS)
 * - Calls submitContactForm service
 * - Dispatches Redux notification on success / error
 * - Field-level API errors reflected back into the form
 * - Character counters on subject and message
 */

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/notificationsSlice';
import { submitContactForm, ContactServiceError } from '@/services/contact';
import { CONTACT_LIMITS } from '@shared/contact';
import { buildContactSchema, type ContactFormValues } from './contactSchema';
import { ContactFormField } from './ContactFormField';

const inputBase = cn(
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground',
  'placeholder:text-muted-foreground',
  'transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
);

const errorInput = 'border-destructive focus-visible:ring-destructive';

export function ContactForm(): React.JSX.Element {
  const { t } = useTranslation('contact');
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(buildContactSchema(t)),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const subjectValue = watch('subject');
  const messageValue = watch('message');

  const onSubmit = useCallback(
    async (data: ContactFormValues): Promise<void> => {
      try {
        await submitContactForm(data);
        dispatch(addNotification({ type: 'success', message: t('sent') }));
        reset();
      } catch (err) {
        if (err instanceof ContactServiceError) {
          // Reflect field-level API errors back into the form
          if (err.fieldErrors) {
            (Object.entries(err.fieldErrors) as [keyof ContactFormValues, string][]).forEach(
              ([field, msg]) => setError(field, { type: 'server', message: msg }),
            );
          } else {
            dispatch(addNotification({ type: 'error', message: err.message ?? t('error') }));
          }
        } else {
          dispatch(addNotification({ type: 'error', message: t('error') }));
        }
      }
    },
    [dispatch, reset, setError, t],
  );

  return (
    <form
      onSubmit={(e) => { void handleSubmit(onSubmit)(e); }}
      noValidate
      aria-label={t('title')}
      className="mt-10 flex flex-col gap-6"
    >
      {/* Name */}
      <ContactFormField id="contact-name" label={t('form.name')} error={errors.name?.message}>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          placeholder={t('form.namePlaceholder')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={cn(inputBase, errors.name && errorInput)}
          {...register('name')}
        />
      </ContactFormField>

      {/* Email */}
      <ContactFormField id="contact-email" label={t('form.email')} error={errors.email?.message}>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder={t('form.emailPlaceholder')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={cn(inputBase, errors.email && errorInput)}
          {...register('email')}
        />
      </ContactFormField>

      {/* Subject */}
      <ContactFormField
        id="contact-subject"
        label={t('form.subject')}
        error={errors.subject?.message}
        charCount={subjectValue?.length ?? 0}
        maxChars={CONTACT_LIMITS.subject.max}
      >
        <input
          id="contact-subject"
          type="text"
          placeholder={t('form.subjectPlaceholder')}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
          className={cn(inputBase, errors.subject && errorInput)}
          {...register('subject')}
        />
      </ContactFormField>

      {/* Message */}
      <ContactFormField
        id="contact-message"
        label={t('form.message')}
        error={errors.message?.message}
        charCount={messageValue?.length ?? 0}
        maxChars={CONTACT_LIMITS.message.max}
      >
        <textarea
          id="contact-message"
          rows={6}
          placeholder={t('form.messagePlaceholder')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={cn(inputBase, 'resize-y', errors.message && errorInput)}
          {...register('message')}
        />
      </ContactFormField>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5',
            'text-sm font-semibold text-primary-foreground transition-opacity',
            'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isSubmitting
            ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            : <Send size={16} aria-hidden="true" />
          }
          {isSubmitting ? t('form.submitting') : t('form.submit')}
        </button>

        {isSubmitSuccessful && !isSubmitting && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {t('sent')}
          </p>
        )}
      </div>
    </form>
  );
}
