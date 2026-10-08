import { AppRoutes } from './AppRoutes';
import { Providers } from './Providers';

export function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}
