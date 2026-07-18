import type { Asiento } from "./asiento";

export interface Sala {
  id: string;
  nombre: string;
  asientos: Asiento[];
}
