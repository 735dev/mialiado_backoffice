import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { emailSchema, passwordSchema, requiredText } from '@/lib/utils/schemas';
import { renderWithProviders } from '@/test/utils';
import { Form } from './Form';
import { FormInput, FormPassword } from './FormInput';
import { useZodForm } from './useZodForm';

const schema = z.object({
  name: requiredText(3, 20),
  email: emailSchema,
  password: passwordSchema,
});
type Values = z.infer<typeof schema>;

function Demo({ onSubmit }: { onSubmit: (v: Values) => void }) {
  const methods = useZodForm<Values>(schema, { name: '', email: '', password: '' });
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput<Values> name="name" label="Nombre" />
      <FormInput<Values> name="email" label="Correo" type="email" />
      <FormPassword<Values> name="password" label="Clave" />
      <Button type="submit">Enviar</Button>
    </Form>
  );
}

describe('formularios RHF + Zod', () => {
  it('muestra errores traducidos y no envia', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<Demo onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Nombre'), 'ab');
    await userEvent.type(screen.getByLabelText('Correo'), 'no-es-correo');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('Debe tener al menos 3 caracteres')).toBeInTheDocument();
    expect(await screen.findByText('Correo inválido')).toBeInTheDocument();
    expect(await screen.findByText('Usa 8 caracteres, una mayúscula y un número')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia valores validos', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<Demo onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Nombre'), 'Pedro');
    await userEvent.type(screen.getByLabelText('Correo'), 'pedro@bigburger.com');
    await userEvent.type(screen.getByLabelText('Clave'), 'Hamburguesa1');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: 'Pedro', email: 'pedro@bigburger.com', password: 'Hamburguesa1' });
  });

  it('el boton de ver contrasena alterna el tipo del campo', async () => {
    renderWithProviders(<Demo onSubmit={() => 0} />);
    const input = screen.getByLabelText('Clave');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
  });
});

describe('esquemas compartidos', () => {
  it('clave: 8+, mayuscula y numero', () => {
    expect(passwordSchema.safeParse('Hamburguesa1').success).toBe(true);
    expect(passwordSchema.safeParse('hamburguesa1').success).toBe(false);
    expect(passwordSchema.safeParse('Ham1').success).toBe(false);
  });
});
