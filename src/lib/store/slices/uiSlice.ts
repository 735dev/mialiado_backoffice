import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type InfoModalType = 'error' | 'success' | 'warning' | 'confirm';

export interface InfoModalState {
  open: boolean;
  type: InfoModalType;
  code?: number;
  /** Clave i18n o texto plano. */
  description: string;
  confirmActionId?: string;
  /** Fuerza el re-render cuando se repite el mismo aviso. */
  id: number;
}

interface UiState {
  infoModal: InfoModalState;
  globalLoading: boolean;
}

const initialState: UiState = {
  infoModal: { open: false, type: 'error', description: '', id: 0 },
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showInfoModal(state, action: PayloadAction<Omit<InfoModalState, 'open' | 'id'>>) {
      state.infoModal = { ...action.payload, open: true, id: Date.now() };
    },
    hideInfoModal(state) {
      state.infoModal.open = false;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const { showInfoModal, hideInfoModal, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
