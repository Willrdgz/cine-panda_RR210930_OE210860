import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Funcion } from "@/types/funcion";

interface FuncionesState {
  items: Funcion[];
}

const initialState: FuncionesState = {
  items: [],
};

const funcionesSlice = createSlice({
  name: "funciones",
  initialState,
  reducers: {
    agregarFuncion: (state, action: PayloadAction<Funcion>) => {
      state.items.push(action.payload);
    },
    editarFuncion: (state, action: PayloadAction<Funcion>) => {
      const indice = state.items.findIndex(
        (funcion) => funcion.id === action.payload.id,
      );

      if (indice !== -1) {
        state.items[indice] = action.payload;
      }
    },
    eliminarFuncion: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (funcion) => funcion.id !== action.payload,
      );
    },
  },
});

export const { agregarFuncion, editarFuncion, eliminarFuncion } =
  funcionesSlice.actions;
export default funcionesSlice.reducer;
