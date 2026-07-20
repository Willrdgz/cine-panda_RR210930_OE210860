export interface ClienteReserva {
  nombre: string;
  email: string;
  telefono: string;
}

export interface Reserva {
  id: string;
  peliculaCodigo: string;
  funcionId: string;
  salaId: string;
  asientosIds: string[];
  cantidadBoletos: number;
  total: number;
  fechaCreacion: string;
  cliente: ClienteReserva;
}
