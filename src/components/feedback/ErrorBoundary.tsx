import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { dictionaries, translate } from '@/lib/i18n';
import { getStoreRef } from '@/lib/store';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const dict = dictionaries[getStoreRef().getState().lang.current];
    return (
      <EmptyState
        title={translate(dict, 'errors.genericTitle')}
        description={translate(dict, 'errors.genericDetail')}
        action={<Button onClick={() => window.location.reload()}>{translate(dict, 'common.retry')}</Button>}
      />
    );
  }
}
