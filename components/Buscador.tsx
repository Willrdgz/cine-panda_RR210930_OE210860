interface BuscadorProps {
  valor: string;
  alCambiar: (valor: string) => void;
}

export default function Buscador({ valor, alCambiar }: BuscadorProps) {
  return (
    <label className="campo buscador">
      <span>Buscar mientras escribe</span>
      <div className="entrada-con-icono">
        <span aria-hidden="true">⌕</span>
        <input
          onChange={(evento) => alCambiar(evento.target.value)}
          placeholder="Nombre, género, clasificación o sala..."
          type="search"
          value={valor}
        />
      </div>
    </label>
  );
}
