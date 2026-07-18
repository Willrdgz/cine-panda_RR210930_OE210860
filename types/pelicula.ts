export type EstadoPelicula = "disponible" | "no-disponible";

export interface Pelicula {
  codigo: string;
  nombre: string;
  genero: string;
  duracion: number;
  clasificacion: string;
  salaId: string;
  precio: number;
  estado: EstadoPelicula;
}
