import { AliLogo } from '@/components/shell/icons';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { CredentialsForm } from '../components/CredentialsForm';
import { TwoFactorForm } from '../components/TwoFactorForm';
import { useLogin } from '../hooks/useLogin';

export const routeName = PATHS.login;

/** B01: acceso al panel con segundo factor (TOTP). */
export default function LoginView() {
  const t = useT();
  const login = useLogin();
  const isCode = login.step === 'code' && login.challenge;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-panel bg-surface p-8 shadow-e2">
        <div className="flex items-center gap-2.5">
          <AliLogo />
          <span className="text-xl font-extrabold tracking-tight">aliado</span>
          <span className="ml-auto rounded-pill bg-surface-2 px-2.5 font-mono text-xs font-semibold leading-6 tracking-widest text-ink-soft">
            {t('common.adminBadge')}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{isCode ? t('acceso.verifyTitle') : t('acceso.title')}</h1>
          <p className="mt-2 text-ink-muted">{isCode ? t('acceso.step2') : t('acceso.subtitle')}</p>
        </div>
        {login.challenge && isCode ? (
          <TwoFactorForm
            challenge={login.challenge}
            correo={login.correo}
            busy={login.busy}
            error={login.error}
            onSubmit={(v) => void login.submitCode(v)}
            onBack={login.restart}
          />
        ) : (
          <CredentialsForm busy={login.busy} error={login.error} onSubmit={(v) => void login.submitCredentials(v)} />
        )}
        <p className="text-xs text-ink-muted">{t('acceso.footer')}</p>
      </div>
    </div>
  );
}
