import { configureStore } from "@reduxjs/toolkit";
import funcionesReducer from "./slices/funcionesSlice";
import peliculasReducer from "./slices/peliculasSlice";
import reservasReducer from "./slices/reservasSlice";
import salasReducer from "./slices/salasSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      peliculas: peliculasReducer,
      funciones: funcionesReducer,
      reservas: reservasReducer,
      salas: salasReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
