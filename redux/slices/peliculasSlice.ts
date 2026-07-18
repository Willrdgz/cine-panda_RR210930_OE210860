import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pelicula } from "@/types/pelicula";

interface PeliculasState {
  items: Pelicula[];
}

const initialState: PeliculasState = {
  items: [],
};

const peliculasSlice = createSlice({
  name: "peliculas",
  initialState,
  reducers: {
    agregarPelicula: (state, action: PayloadAction<Pelicula>) => {
      state.items.push(action.payload);
    },
    editarPelicula: (state, action: PayloadAction<Pelicula>) => {
      const indice = state.items.findIndex(
        (pelicula) => pelicula.codigo === action.payload.codigo,
      );

      if (indice !== -1) {
        state.items[indice] = action.payload;
      }
    },
    eliminarPelicula: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (pelicula) => pelicula.codigo !== action.payload,
      );
    },
  },
});

export const { agregarPelicula, editarPelicula, eliminarPelicula } =
  peliculasSlice.actions;
export default peliculasSlice.reducer;
