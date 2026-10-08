import { useEffect, useMemo, useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useT } from '@/lib/hooks/useT';
import { listarCategorias, listarZonas, type CategoriaOpcion, type ComercioDetalle, type EdicionComercio, type ZonaOpcion } from '@/providers/comerciosProvider';
import { editarSchema, type EditarValues } from '../schemas/comercios';

interface Props {
  open: boolean;
  c: ComercioDetalle;
  busy: boolean;
  onClose: () => void;
  /** Recibe solo los campos que cambiaron. Devuelve true si se guardo. */
  onSubmit: (body: EdicionComercio) => Promise<boolean>;
}

const texto = (v: string | null | undefined): string => v ?? '';

/** Edicion de los datos del comercio (PATCH /comercios/{id}, requiere `editar`): solo se envia lo que cambio. */
export function EditarComercioModal({ open, c, busy, onClose, onSubmit }: Props) {
  const t = useT();
  const [categorias, setCategorias] = useState<CategoriaOpcion[]>([]);
  const [zonas, setZonas] = useState<ZonaOpcion[]>([]);
  // El detalle trae la ruta «Padre › Hijo»; el id de la categoria actual se deduce por el nombre de la hoja.
  const actualId = useMemo(() => {
    const hoja = (c.categoria ?? '').split(' › ').pop()?.trim();
    return categorias.find((x) => x.nombre === hoja)?.id ?? '';
  }, [categorias, c.categoria]);
  const inicial = useMemo<EditarValues>(
    () => ({
      nombre: c.nombre,
      razon_social: texto(c.razon_social),
      direccion: texto(c.direccion),
      zona: texto(c.zona),
      ciudad: texto(c.ciudad),
      categoria_id: actualId,
      whatsapp: texto(c.whatsapp),
      correo_contacto: texto(c.correo_contacto),
    }),
    [c, actualId],
  );
  const methods = useZodForm<EditarValues>(editarSchema, inicial);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void listarCategorias().then((r) => !cancelled && r.ok && setCategorias(r.data));
    void listarZonas().then((r) => !cancelled && r.ok && setZonas(r.data));
    return () => {
      cancelled = true;
    };
  }, [open]);
  useEffect(() => {
    if (open) methods.reset(inicial);
  }, [open, inicial, methods]);

  const zonaOpciones = useMemo(() => {
    const nombres = zonas.map((z) => z.nombre);
    if (c.zona && !nombres.includes(c.zona)) nombres.unshift(c.zona);
    return nombres.map((n) => ({ value: n, label: n }));
  }, [zonas, c.zona]);

  const submit = async (v: EditarValues) => {
    const body: EdicionComercio = {};
    const keys = ['nombre', 'razon_social', 'direccion', 'zona', 'ciudad', 'whatsapp', 'correo_contacto'] as const;
    for (const k of keys) {
      const nuevo = texto(v[k]).trim();
      if (nuevo !== texto(inicial[k]).trim() && nuevo !== '') body[k] = nuevo;
    }
    if (v.categoria_id !== '' && v.categoria_id !== undefined && v.categoria_id !== inicial.categoria_id) body.categoria_id = Number(v.categoria_id);
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    if (await onSubmit(body)) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('comercios.editar.title')} description={t('comercios.editar.descripcion')}>
      <Form methods={methods} onSubmit={submit}>
        <FormInput<EditarValues> name="nombre" label="comercios.editar.nombre" autoComplete="off" />
        <FormInput<EditarValues> name="razon_social" label="comercios.editar.razon_social" autoComplete="off" />
        <FormInput<EditarValues> name="direccion" label="comercios.editar.direccion" autoComplete="off" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect<EditarValues> name="zona" label="comercios.editar.zona" options={zonaOpciones} placeholder="comercios.editar.categoriaPlaceholder" />
          <FormInput<EditarValues> name="ciudad" label="comercios.editar.ciudad" autoComplete="off" />
        </div>
        <FormSelect<EditarValues>
          name="categoria_id"
          label="comercios.editar.categoria"
          options={categorias.map((x) => ({ value: x.id, label: x.nombre }))}
          placeholder="comercios.editar.categoriaPlaceholder"
          asNumber
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput<EditarValues> name="whatsapp" label="comercios.editar.whatsapp" inputMode="tel" autoComplete="off" />
          <FormInput<EditarValues> name="correo_contacto" type="email" label="comercios.editar.correo" autoComplete="off" />
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" size="md" isLoading={busy}>
            {t('comercios.editar.guardar')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
