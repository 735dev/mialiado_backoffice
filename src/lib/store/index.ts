import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import auth from './slices/authSlice';
import lang from './slices/langSlice';
import theme from './slices/themeSlice';
import ui from './slices/uiSlice';

const rootReducer = combineReducers({ auth, theme, lang, ui });

const persistedReducer = persistReducer(
  {
    key: 'aliado-backoffice',
    storage,
    whitelist: ['auth', 'theme', 'lang'], // ui NUNCA se persiste
    version: 1,
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) =>
    gDM({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

/** Acceso al store fuera de React (interceptors, notify...). */
export function getStoreRef(): typeof store {
  return store;
}

/** Access token VIGENTE (el interceptor lo reemplaza al renovar la sesion). */
export function getAccessToken(): string | null {
  return store.getState().auth.token;
}
