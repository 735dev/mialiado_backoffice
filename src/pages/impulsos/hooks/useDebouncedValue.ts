import { useEffect, useState } from 'react';

/** Devuelve `value` tras `delay` ms sin cambios (busquedas que no deben disparar una peticion por tecla). */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
