import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { env } from '@/lib/config/env';

export type Lang = 'es' | 'en';
interface LangState {
  current: Lang;
}
const initialState: LangState = { current: env.defaultLang };

const langSlice = createSlice({
  name: 'lang',
  initialState,
  reducers: {
    setLang(state, action: PayloadAction<Lang>) {
      state.current = action.payload;
    },
  },
});

export const { setLang } = langSlice.actions;
export default langSlice.reducer;
