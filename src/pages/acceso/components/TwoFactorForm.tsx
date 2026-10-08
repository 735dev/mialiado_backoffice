import { Button } from '@/components/ui/Button';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { useZodForm } from '@/components/form/useZodForm';
import { useT } from '@/lib/hooks/useT';
import type { LoginChallenge } from '@/providers/adminAuthProvider';
import { codeSchema, type CodeValues } from '../schemas/login';

interface Props {
  challenge: LoginChallenge;
  correo: string;
  busy: boolean;
  error: string | null;
  onSubmit: (values: CodeValues) => void;
  onBack: () => void;
}

/** Paso 2 de B01: codigo TOTP de 6 digitos. En el primer ingreso muestra el secreto para la app autenticadora. */
export function TwoFactorForm({ challenge, correo, busy, error, onSubmit, onBack }: Props) {
  const t = useT();
  const methods = useZodForm<CodeValues>(codeSchema, { codigo: '' });
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <p className="text-sm text-ink-soft">{t('acceso.codeIntro', { correo })}</p>

      {!challenge.configurado && (
        <div className="flex flex-col gap-2 rounded-field bg-surface-2 p-4 text-sm" data-testid="setup-2fa">
          <p className="font-semibold text-ink">{t('acceso.setupTitle')}</p>
          <p className="text-ink-soft">{t('acceso.setupHelp')}</p>
          {challenge.secreto && (
            <p className="break-all font-mono text-base font-semibold tracking-widest text-ink" aria-label={t('acceso.secret')}>
              {challenge.secreto}
            </p>
          )}
          {challenge.otpauthUri?.startsWith('otpauth://') && (
            <a href={challenge.otpauthUri} className="font-semibold text-primary-deep underline">
              {t('acceso.openAuthenticator')}
            </a>
          )}
        </div>
      )}

      <FormInput<CodeValues> name="codigo" label="acceso.code" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" />
      {error && (
        <p role="alert" className="rounded-field bg-err-tint px-4 py-3 text-sm font-semibold text-err-deep">
          {t(error)}
        </p>
      )}
      <Button type="submit" isLoading={busy}>
        {t('acceso.verify')}
      </Button>
      <Button variant="ghost" onClick={onBack} disabled={busy}>
        {t('acceso.useOtherAccount')}
      </Button>
    </Form>
  );
}
