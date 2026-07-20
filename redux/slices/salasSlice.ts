import { createSlice } from "@reduxjs/toolkit";
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

const salasSlice = createSlice({
  name: "salas",
  initialState,
  reducers: {},
});

export default salasSlice.reducer;
