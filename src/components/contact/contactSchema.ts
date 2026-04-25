/**
 * @file src/components/contact/contactSchema.ts
 *
 * Zod validation schema for the contact form.
 * Built from shared CONTACT_LIMITS so frontend and API always stay in sync.
 */

import { z } from 'zod';
import { CONTACT_LIMITS } from '@shared/contact';

const L = CONTACT_LIMITS;

/**
 * Factory that produces a locale-aware schema.
 * Pass `t` from `useTranslation('contact')` to get localised messages.
 */
export const buildContactSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(L.name.min, t('validation.nameMin'))
      .max(L.name.max, t('validation.nameMax')),

    email: z
      .string()
      .email(t('validation.emailInvalid'))
      .max(L.email.max, t('validation.emailMax')),

    subject: z
      .string()
      .min(L.subject.min, t('validation.subjectMin'))
      .max(L.subject.max, t('validation.subjectMax')),

    message: z
      .string()
      .min(L.message.min, t('validation.messageMin'))
      .max(L.message.max, t('validation.messageMax')),
  });

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>;
