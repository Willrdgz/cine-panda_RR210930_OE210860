import type { Pelicula } from "@/types/pelicula";
import PeliculaFila from "./PeliculaFila";

interface TablaPeliculasProps {
  peliculas: Pelicula[];
  obtenerSalas: (codigoPelicula: string) => string;
  alEditar: (pelicula: Pelicula) => void;
  alEliminar: (pelicula: Pelicula) => void;
}

export default function TablaPeliculas(props: TablaPeliculasProps) {
  if (!props.peliculas.length) {
    return <div className="estado-vacio"><span>🎬</span><h3>No encontramos películas</h3><p>Agrega una película o modifica los filtros.</p></div>;
  }

  return (
    <div className="tabla-contenedor">
      <table>
        <thead><tr><th>Película</th><th>Género</th><th>Detalles</th><th>Salas programadas</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {props.peliculas.map((pelicula) => (
            <PeliculaFila
              alEditar={props.alEditar}
              alEliminar={props.alEliminar}
              key={pelicula.codigo}
              pelicula={pelicula}
              salas={props.obtenerSalas(pelicula.codigo)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
