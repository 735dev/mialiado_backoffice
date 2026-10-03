import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import { SECCIONES } from './lib/secciones';
import LoginPage from './pages/LoginPage';
import SeccionPage from './pages/SeccionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        {SECCIONES.map((s) => (
          <Route key={s.ruta} path={s.ruta} element={<SeccionPage seccion={s} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
