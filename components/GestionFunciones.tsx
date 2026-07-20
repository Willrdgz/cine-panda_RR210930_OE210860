"use client";

import { useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  agregarFuncion,
  editarFuncion,
  eliminarFuncion,
} from "@/redux/slices/funcionesSlice";
import type { Funcion } from "@/types/funcion";

const inicial = { peliculaCodigo: "", salaId: "", fecha: "", hora: "" };

export default function GestionFunciones() {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.items);
  const funciones = useAppSelector((state) => state.funciones.items);
  const reservas = useAppSelector((state) => state.reservas.items);
  const salas = useAppSelector((state) => state.salas.items);
  const [datos, setDatos] = useState(inicial);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setError("");

    if (!datos.peliculaCodigo || !datos.salaId || !datos.fecha || !datos.hora) {
      setError("Complete todos los campos de la función.");
      return;
    }

    const repetida = funciones.some(
      (funcion) =>
        funcion.id !== editandoId &&
        funcion.salaId === datos.salaId &&
        funcion.fecha === datos.fecha &&
        funcion.hora === datos.hora,
    );

    if (repetida) {
      setError("Ya existe una función en esa sala, fecha y horario.");
      return;
    }

    const sala = salas.find(({ id }) => id === datos.salaId);
    if (!sala) {
      setError("La sala seleccionada no existe.");
      return;
    }

    const funcionAnterior = funciones.find(({ id }) => id === editandoId);
    const conservaAsientos = funcionAnterior?.salaId === datos.salaId;
    const funcion: Funcion = {
      id: editandoId ?? crypto.randomUUID(),
      ...datos,
      asientos: conservaAsientos
        ? funcionAnterior.asientos
        : sala.asientos.map((asiento) => ({ ...asiento, estado: "disponible" })),
    };

    dispatch(editandoId ? editarFuncion(funcion) : agregarFuncion(funcion));
    setMensaje(editandoId ? "Función actualizada." : "Función registrada.");
    setDatos(inicial);
    setEditandoId(null);
  };

  const prepararEdicion = (funcion: Funcion) => {
    if (reservas.some((reserva) => reserva.funcionId === funcion.id)) {
      setError("No se puede editar una función que ya tiene reservas.");
      return;
    }

    setEditandoId(funcion.id);
    setDatos({
      peliculaCodigo: funcion.peliculaCodigo,
      salaId: funcion.salaId,
      fecha: funcion.fecha,
      hora: funcion.hora,
    });
    setError("");
  };

  const eliminar = (funcion: Funcion) => {
    if (reservas.some((reserva) => reserva.funcionId === funcion.id)) {
      setError("No se puede eliminar una función que ya tiene reservas.");
      return;
    }

    if (window.confirm("¿Eliminar esta función?")) {
      dispatch(eliminarFuncion(funcion.id));
      setMensaje("Función eliminada.");
    }
  };

  const nombrePelicula = (codigo: string) =>
    peliculas.find((pelicula) => pelicula.codigo === codigo)?.nombre ?? codigo;
  const nombreSala = (id: string) =>
    salas.find((sala) => sala.id === id)?.nombre ?? id;

  return (
    <section className="modulo">
      <div className="titulo-seccion">
        <div>
          <p className="eyebrow">Programación</p>
          <h2>Administración de funciones</h2>
          <p>Asigna películas a salas sin duplicar horarios.</p>
        </div>
        <span className="contador">{funciones.length} funciones</span>
      </div>

      {mensaje && (
        <div className="mensaje" role="status">
          {mensaje}
          <button onClick={() => setMensaje("")} aria-label="Cerrar mensaje">×</button>
        </div>
      )}

      <form className="formulario" onSubmit={enviar}>
        <div className="encabezado-formulario">
          <div>
            <p className="eyebrow">{editandoId ? "Edición" : "Nueva programación"}</p>
            <h3>{editandoId ? "Editar función" : "Registrar función"}</h3>
          </div>
          {editandoId && (
            <button
              className="boton-texto"
              type="button"
              onClick={() => {
                setEditandoId(null);
                setDatos(inicial);
              }}
            >
              Cancelar
            </button>
          )}
        </div>

        {error && <p className="alerta-error" role="alert">{error}</p>}
        {!peliculas.length && (
          <p className="alerta-info">Primero debes registrar al menos una película.</p>
        )}

        <div className="rejilla-formulario cuatro">
          <label className="campo">
            <span>Película</span>
            <select
              value={datos.peliculaCodigo}
              onChange={(evento) =>
                setDatos({ ...datos, peliculaCodigo: evento.target.value })
              }
            >
              <option value="">Seleccione</option>
              {peliculas
                .filter((pelicula) => pelicula.estado === "disponible")
                .map((pelicula) => (
                  <option value={pelicula.codigo} key={pelicula.codigo}>
                    {pelicula.nombre}
                  </option>
                ))}
            </select>
          </label>
          <label className="campo">
            <span>Sala</span>
            <select
              value={datos.salaId}
              onChange={(evento) => setDatos({ ...datos, salaId: evento.target.value })}
            >
              <option value="">Seleccione</option>
              {salas.map((sala) => (
                <option value={sala.id} key={sala.id}>{sala.nombre}</option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Fecha</span>
            <input
              type="date"
              value={datos.fecha}
              onChange={(evento) => setDatos({ ...datos, fecha: evento.target.value })}
            />
          </label>
          <label className="campo">
            <span>Hora</span>
            <input
              type="time"
              value={datos.hora}
              onChange={(evento) => setDatos({ ...datos, hora: evento.target.value })}
            />
          </label>
        </div>
        <button disabled={!peliculas.length} className="boton-primario" type="submit">
          {editandoId ? "Guardar cambios" : "Registrar función"}
        </button>
      </form>

      <div className="panel tabla-contenedor">
        {funciones.length ? (
          <table>
            <thead>
              <tr><th>Película</th><th>Sala</th><th>Fecha</th><th>Hora</th><th>Disponibilidad</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {funciones.map((funcion) => {
                const ocupados = funcion.asientos.filter(
                  (asiento) => asiento.estado === "ocupado",
                ).length;
                return (
                  <tr key={funcion.id}>
                    <td><strong>{nombrePelicula(funcion.peliculaCodigo)}</strong></td>
                    <td>{nombreSala(funcion.salaId)}</td>
                    <td>{new Date(`${funcion.fecha}T12:00:00`).toLocaleDateString("es-SV")}</td>
                    <td>{funcion.hora}</td>
                    <td>{funcion.asientos.length - ocupados}/{funcion.asientos.length} libres</td>
                    <td className="acciones-tabla">
                      <button onClick={() => prepararEdicion(funcion)}>Editar</button>
                      <button className="peligro" onClick={() => eliminar(funcion)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="estado-vacio">
            <span>🕒</span><h3>Aún no hay funciones</h3>
            <p>Registra una película y programa su primera función.</p>
          </div>
        )}
      </div>
    </section>
  );
}
