interface FiltrosProps {
  genero: string;
  clasificacion: string;
  sala: string;
  estado: string;
  generos: string[];
  clasificaciones: string[];
  salas: { id: string; nombre: string }[];
  alCambiar: (campo: string, valor: string) => void;
  alLimpiar: () => void;
}

export default function Filtros(props: FiltrosProps) {
  return (
    <div className="filtros">
      <label className="campo">
        <span>Género</span>
        <select value={props.genero} onChange={(e) => props.alCambiar("genero", e.target.value)}>
          <option value="">Todos</option>
          {props.generos.map((valor) => <option key={valor}>{valor}</option>)}
        </select>
      </label>
      <label className="campo">
        <span>Clasificación</span>
        <select value={props.clasificacion} onChange={(e) => props.alCambiar("clasificacion", e.target.value)}>
          <option value="">Todas</option>
          {props.clasificaciones.map((valor) => <option key={valor}>{valor}</option>)}
        </select>
      </label>
      <label className="campo">
        <span>Sala</span>
        <select value={props.sala} onChange={(e) => props.alCambiar("sala", e.target.value)}>
          <option value="">Todas</option>
          {props.salas.map((sala) => <option key={sala.id} value={sala.id}>{sala.nombre}</option>)}
        </select>
      </label>
      <label className="campo">
        <span>Estado</span>
        <select value={props.estado} onChange={(e) => props.alCambiar("estado", e.target.value)}>
          <option value="">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="no-disponible">No disponible</option>
        </select>
      </label>
      <button className="boton-secundario boton-filtro" onClick={props.alLimpiar} type="button">Limpiar</button>
    </div>
  );
}
