import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Reserva } from "@/types/reserva";

interface ReservasState {
  items: Reserva[];
}

const initialState: ReservasState = {
  items: [],
};

const reservasSlice = createSlice({
  name: "reservas",
  initialState,
  reducers: {
    confirmarReserva: (state, action: PayloadAction<Reserva>) => {
      state.items.push(action.payload);
    },
  },
});

export const { confirmarReserva } = reservasSlice.actions;
export default reservasSlice.reducer;
