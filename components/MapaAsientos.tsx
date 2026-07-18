import type { Asiento } from "@/types/asiento";

interface MapaAsientosProps {
  asientos: Asiento[];
  cantidadMaxima: number;
  alAlternar: (id: string) => void;
}

export default function MapaAsientos({ asientos, cantidadMaxima, alAlternar }: MapaAsientosProps) {
  const seleccionados = asientos.filter((a) => a.estado === "seleccionado").length;
  return (
    <div className="mapa-wrapper">
      <div className="pantalla">PANTALLA</div>
      <div className="mapa-asientos" aria-label="Mapa de asientos">
        {asientos.map((asiento) => (
          <button
            aria-label={`Asiento ${asiento.id}, ${asiento.estado}`}
            className={`asiento ${asiento.estado}`}
            disabled={asiento.estado === "ocupado" || (asiento.estado === "disponible" && seleccionados >= cantidadMaxima)}
            key={asiento.id}
            onClick={() => alAlternar(asiento.id)}
            type="button"
          >{asiento.id}</button>
        ))}
      </div>
      <div className="leyenda"><span><i className="disponible" />Disponible</span><span><i className="seleccionado" />Seleccionado</span><span><i className="ocupado" />Ocupado</span></div>
    </div>
  );
}
