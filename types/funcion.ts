import type { Asiento } from "./asiento";

export interface Funcion {
  id: string;
  peliculaCodigo: string;
  salaId: string;
  fecha: string;
  hora: string;
  asientos: Asiento[];
}
