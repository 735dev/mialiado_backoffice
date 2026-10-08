import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Permisos } from '@/lib/constants/modules';
import type { Role } from '@/lib/constants/roles';

export interface AuthUser {
  id: number | string;
  nombre: string;
  correo: string;
  role: Role;
  /** Texto del rol para mostrar (Administrador, Operaciones...). */
  rolEtiqueta?: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  /** Matriz de permisos por modulo; null hasta que se carga /auth/me. */
  permisos: Permisos | null;
  isAuthenticated: boolean;
}

export const authInitialState: AuthState = { token: null, refreshToken: null, user: null, permisos: null, isAuthenticated: false };

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    signedIn(state, action: PayloadAction<{ token: string; refreshToken?: string; user: AuthUser; permisos: Permisos | null }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.user = action.payload.user;
      state.permisos = action.payload.permisos;
      state.isAuthenticated = true;
    },
    /** Par nuevo tras POST /auth/refresh (el refresh anterior queda revocado). */
    tokensRenewed(state, action: PayloadAction<{ token: string; refreshToken: string }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    /** Perfil y permisos frescos de /auth/me (la matriz puede cambiar mientras hay sesion). */
    profileLoaded(state, action: PayloadAction<{ user: AuthUser; permisos: Permisos }>) {
      state.user = action.payload.user;
      state.permisos = action.payload.permisos;
    },
    logout() {
      return authInitialState;
    },
  },
});

export const { signedIn, tokensRenewed, profileLoaded, logout } = authSlice.actions;
export default authSlice.reducer;
