import { Button } from '@/components/ui/Button';
import { Form } from '@/components/form/Form';
import { FormInput, FormPassword } from '@/components/form/FormInput';
import { useZodForm } from '@/components/form/useZodForm';
import { useT } from '@/lib/hooks/useT';
import { credentialsSchema, type CredentialsValues } from '../schemas/login';

interface Props {
  busy: boolean;
  error: string | null;
  onSubmit: (values: CredentialsValues) => void;
}

/** Paso 1 de B01: correo del equipo y contrasena. */
export function CredentialsForm({ busy, error, onSubmit }: Props) {
  const t = useT();
  const methods = useZodForm<CredentialsValues>(credentialsSchema, { correo: '', password: '' });
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput<CredentialsValues> name="correo" label="acceso.email" type="email" autoComplete="username" inputMode="email" />
      <FormPassword<CredentialsValues> name="password" label="acceso.password" autoComplete="current-password" />
      {error && (
        <p role="alert" className="rounded-field bg-err-tint px-4 py-3 text-sm font-semibold text-err-deep">
          {t(error)}
        </p>
      )}
      <Button type="submit" isLoading={busy}>
        {t('acceso.enter')}
      </Button>
    </Form>
  );
}
