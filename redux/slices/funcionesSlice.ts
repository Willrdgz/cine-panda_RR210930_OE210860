import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Funcion } from "@/types/funcion";

interface FuncionesState {
  items: Funcion[];
}

interface AsientoFuncionPayload {
  funcionId: string;
  asientoId: string;
}

interface OcuparAsientosPayload {
  funcionId: string;
  asientosIds: string[];
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
    alternarSeleccionAsiento: (
      state,
      action: PayloadAction<AsientoFuncionPayload>,
    ) => {
      const funcion = state.items.find(({ id }) => id === action.payload.funcionId);
      const asiento = funcion?.asientos.find(
        ({ id }) => id === action.payload.asientoId,
      );

      if (!asiento || asiento.estado === "ocupado") return;

      asiento.estado =
        asiento.estado === "seleccionado" ? "disponible" : "seleccionado";
    },
    limpiarSeleccionFuncion: (state, action: PayloadAction<string>) => {
      const funcion = state.items.find(({ id }) => id === action.payload);

      funcion?.asientos.forEach((asiento) => {
        if (asiento.estado === "seleccionado") asiento.estado = "disponible";
      });
    },
    ocuparAsientosFuncion: (
      state,
      action: PayloadAction<OcuparAsientosPayload>,
    ) => {
      const funcion = state.items.find(({ id }) => id === action.payload.funcionId);

      funcion?.asientos.forEach((asiento) => {
        if (action.payload.asientosIds.includes(asiento.id)) {
          asiento.estado = "ocupado";
        }
      });
    },
  },
});

export const {
  agregarFuncion,
  editarFuncion,
  eliminarFuncion,
  alternarSeleccionAsiento,
  limpiarSeleccionFuncion,
  ocuparAsientosFuncion,
} = funcionesSlice.actions;
export default funcionesSlice.reducer;
