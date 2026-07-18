import type { Pelicula } from "@/types/pelicula";

interface PeliculaFilaProps {
  pelicula: Pelicula;
  sala: string;
  alEditar: (pelicula: Pelicula) => void;
  alEliminar: (pelicula: Pelicula) => void;
}

export default function PeliculaFila({
  pelicula,
  sala,
  alEditar,
  alEliminar,
}: PeliculaFilaProps) {
  return (
    <tr>
      <td><strong>{pelicula.nombre}</strong><small>{pelicula.codigo}</small></td>
      <td>{pelicula.genero}</td>
      <td>{pelicula.duracion} min · {pelicula.clasificacion}</td>
      <td>{sala}</td>
      <td>${pelicula.precio.toFixed(2)}</td>
      <td><span className={`insignia ${pelicula.estado}`}>{pelicula.estado === "disponible" ? "Disponible" : "No disponible"}</span></td>
      <td className="acciones-tabla">
        <button onClick={() => alEditar(pelicula)} type="button">Editar</button>
        <button className="peligro" onClick={() => alEliminar(pelicula)} type="button">Eliminar</button>
      </td>
    </tr>
  );
}
