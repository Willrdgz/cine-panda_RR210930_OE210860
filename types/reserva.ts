export interface Reserva {
  id: string;
  peliculaCodigo: string;
  funcionId: string;
  salaId: string;
  asientosIds: string[];
  cantidadBoletos: number;
  total: number;
  fechaCreacion: string;
}
