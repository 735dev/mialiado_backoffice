// Setup comun de los tests (vitest + jsdom).
//
// `@testing-library/jest-dom` añade los matchers de DOM (toBeInTheDocument,
// toBeDisabled...) que usan los tests del copiloto.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { configure } from '@testing-library/dom';

// Con 4 hilos de vitest compitiendo, el 1 s por defecto de findBy/waitFor da fallos intermitentes por carga.
configure({ asyncUtilTimeout: 10_000 });

// Sin esto, el arbol de un test sigue montado en el siguiente y un
// `getByRole` encuentra dos botones iguales. Falla de forma confusa: el test
// que rompe no es el que dejo la basura.
afterEach(() => {
  cleanup();
});

// jsdom no implementa `Element.scrollTo` (ni `scrollIntoView`): no hay layout
// que desplazar. El autoscroll del panel al llegar un turno nuevo es
// comportamiento real de navegador, asi que se stubea en vez de quitarlo del
// componente.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}


// jsdom no implementa matchMedia (useTheme/useMediaQuery).
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// redux-persist guarda en localStorage: se limpia entre pruebas para que ninguna herede la sesion de otra.
afterEach(() => {
  localStorage.clear();
});
