import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { DisplayMessage } from '@/components/feedback/DisplayMessage';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { ToasterRoot } from '@/components/feedback/ToasterRoot';
import { persistor, store } from '@/lib/store';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <ErrorBoundary>
            <BrowserRouter>
              {children}
              <DisplayMessage />
              <ToasterRoot />
            </BrowserRouter>
          </ErrorBoundary>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
