import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Asiento } from "@/types/asiento";
import type { Sala } from "@/types/sala";

const crearAsientos = (): Asiento[] =>
  ["A", "B", "C", "D"].flatMap((fila) =>
    Array.from({ length: 5 }, (_, indice) => ({
      id: `${fila}${indice + 1}`,
      fila,
      numero: indice + 1,
      estado: "disponible" as const,
    })),
  );

interface SalasState {
  items: Sala[];
}

const initialState: SalasState = {
  items: [1, 2, 3].map((numero) => ({
    id: `sala-${numero}`,
    nombre: `Sala ${numero}`,
    asientos: crearAsientos(),
  })),
};

interface AsientoPayload {
  salaId: string;
  asientoId: string;
}

interface OcuparAsientosPayload {
  salaId: string;
  asientosIds: string[];
}

const salasSlice = createSlice({
  name: "salas",
  initialState,
  reducers: {
    alternarSeleccionAsiento: (
      state,
      action: PayloadAction<AsientoPayload>,
    ) => {
      const sala = state.items.find(({ id }) => id === action.payload.salaId);
      const asiento = sala?.asientos.find(
        ({ id }) => id === action.payload.asientoId,
      );

      if (!asiento || asiento.estado === "ocupado") return;

      asiento.estado =
        asiento.estado === "seleccionado" ? "disponible" : "seleccionado";
    },
    limpiarSeleccion: (state, action: PayloadAction<string>) => {
      const sala = state.items.find(({ id }) => id === action.payload);

      sala?.asientos.forEach((asiento) => {
        if (asiento.estado === "seleccionado") {
          asiento.estado = "disponible";
        }
      });
    },
    ocuparAsientos: (state, action: PayloadAction<OcuparAsientosPayload>) => {
      const sala = state.items.find(({ id }) => id === action.payload.salaId);

      sala?.asientos.forEach((asiento) => {
        if (action.payload.asientosIds.includes(asiento.id)) {
          asiento.estado = "ocupado";
        }
      });
    },
  },
});

export const { alternarSeleccionAsiento, limpiarSeleccion, ocuparAsientos } =
  salasSlice.actions;
export default salasSlice.reducer;
