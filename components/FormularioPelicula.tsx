"use client";

import { useState, type FormEvent } from "react";
import type { Pelicula } from "@/types/pelicula";

type DatosFormulario = Omit<Pelicula, "duracion" | "precio"> & {
  duracion: string;
  precio: string;
};

interface FormularioPeliculaProps {
  peliculaEditar: Pelicula | null;
  codigosExistentes: string[];
  alGuardar: (pelicula: Pelicula) => void;
  alCancelar: () => void;
}

const datosIniciales: DatosFormulario = {
  codigo: "",
  nombre: "",
  genero: "",
  duracion: "",
  clasificacion: "",
  precio: "",
  estado: "disponible",
};

export default function FormularioPelicula({
  peliculaEditar,
  codigosExistentes,
  alGuardar,
  alCancelar,
}: FormularioPeliculaProps) {
  const [datos, setDatos] = useState<DatosFormulario>(() =>
    peliculaEditar
      ? {
          ...peliculaEditar,
          duracion: String(peliculaEditar.duracion),
          precio: String(peliculaEditar.precio),
        }
      : datosIniciales,
  );
  const [errores, setErrores] = useState<Record<string, string>>({});

  const cambiar = (campo: keyof DatosFormulario, valor: string) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: "" }));
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const nuevosErrores: Record<string, string> = {};
    const codigo = datos.codigo.trim().toUpperCase();
    const nombre = datos.nombre.trim();
    const duracion = Number(datos.duracion);
    const precio = Number(datos.precio);

    if (!codigo) nuevosErrores.codigo = "Ingrese un código.";
    if (!peliculaEditar && codigosExistentes.includes(codigo)) {
      nuevosErrores.codigo = "Ya existe una película con este código.";
    }
    if (!nombre) nuevosErrores.nombre = "El nombre es obligatorio.";
    if (!datos.genero.trim()) nuevosErrores.genero = "Ingrese un género.";
    if (!Number.isFinite(duracion) || duracion <= 0) {
      nuevosErrores.duracion = "La duración debe ser mayor que cero.";
    }
    if (!datos.clasificacion) nuevosErrores.clasificacion = "Seleccione una clasificación.";
    if (!Number.isFinite(precio) || precio < 0) {
      nuevosErrores.precio = "El precio no puede ser negativo.";
    }

    if (Object.keys(nuevosErrores).length) {
      setErrores(nuevosErrores);
      return;
    }

    alGuardar({
      codigo,
      nombre,
      genero: datos.genero.trim(),
      duracion,
      clasificacion: datos.clasificacion,
      precio,
      estado: datos.estado,
    });
    setDatos(datosIniciales);
    setErrores({});
  };

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="encabezado-formulario">
        <div>
          <p className="eyebrow">{peliculaEditar ? "Edición" : "Nuevo registro"}</p>
          <h3>{peliculaEditar ? "Editar película" : "Agregar película"}</h3>
        </div>
        {peliculaEditar && <button className="boton-texto" onClick={alCancelar} type="button">Cancelar edición</button>}
      </div>
      <div className="rejilla-formulario">
        <Campo etiqueta="Código" error={errores.codigo}>
          <input disabled={Boolean(peliculaEditar)} value={datos.codigo} onChange={(e) => cambiar("codigo", e.target.value)} placeholder="Ej. P001" />
        </Campo>
        <Campo etiqueta="Nombre" error={errores.nombre}>
          <input value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} placeholder="Nombre de la película" />
        </Campo>
        <Campo etiqueta="Género" error={errores.genero}>
          <input value={datos.genero} onChange={(e) => cambiar("genero", e.target.value)} placeholder="Acción, comedia..." />
        </Campo>
        <Campo etiqueta="Duración (minutos)" error={errores.duracion}>
          <input min="1" type="number" value={datos.duracion} onChange={(e) => cambiar("duracion", e.target.value)} />
        </Campo>
        <Campo etiqueta="Clasificación" error={errores.clasificacion}>
          <select value={datos.clasificacion} onChange={(e) => cambiar("clasificacion", e.target.value)}>
            <option value="">Seleccione</option>
            {['A', 'B', 'B15', 'C', 'D'].map((valor) => <option key={valor}>{valor}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Precio de entrada ($)" error={errores.precio}>
          <input min="0" step="0.01" type="number" value={datos.precio} onChange={(e) => cambiar("precio", e.target.value)} />
        </Campo>
        <Campo etiqueta="Estado">
          <select value={datos.estado} onChange={(e) => cambiar("estado", e.target.value)}>
            <option value="disponible">Disponible</option>
            <option value="no-disponible">No disponible</option>
          </select>
        </Campo>
      </div>
      <button className="boton-primario" type="submit">{peliculaEditar ? "Guardar cambios" : "Agregar película"}</button>
    </form>
  );
}

function Campo({ etiqueta, error, children }: { etiqueta: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={`campo ${error ? "campo-error" : ""}`}>
      <span>{etiqueta}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
