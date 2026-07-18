"use client";

import { useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { agregarFuncion, editarFuncion, eliminarFuncion } from "@/redux/slices/funcionesSlice";
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
    const repetida = funciones.some((funcion) => funcion.id !== editandoId && funcion.salaId === datos.salaId && funcion.fecha === datos.fecha && funcion.hora === datos.hora);
    if (repetida) {
      setError("Ya existe una función en esa sala, fecha y horario.");
      return;
    }
    const funcion: Funcion = { id: editandoId ?? crypto.randomUUID(), ...datos };
    dispatch(editandoId ? editarFuncion(funcion) : agregarFuncion(funcion));
    setMensaje(editandoId ? "Función actualizada." : "Función registrada.");
    setDatos(inicial);
    setEditandoId(null);
  };

  const prepararEdicion = (funcion: Funcion) => {
    setEditandoId(funcion.id);
    setDatos({ peliculaCodigo: funcion.peliculaCodigo, salaId: funcion.salaId, fecha: funcion.fecha, hora: funcion.hora });
    setError("");
  };

  const eliminar = (funcion: Funcion) => {
    if (reservas.some((reserva) => reserva.funcionId === funcion.id)) {
      setError("No se puede eliminar una función que ya tiene reservas.");
      return;
    }
    if (window.confirm("¿Eliminar esta función?")) dispatch(eliminarFuncion(funcion.id));
  };

  const nombrePelicula = (codigo: string) => peliculas.find((p) => p.codigo === codigo)?.nombre ?? codigo;
  const nombreSala = (id: string) => salas.find((s) => s.id === id)?.nombre ?? id;

  return (
    <section className="modulo">
      <div className="titulo-seccion"><div><p className="eyebrow">Programación</p><h2>Administración de funciones</h2><p>Asigna películas a salas sin duplicar horarios.</p></div><span className="contador">{funciones.length} funciones</span></div>
      {mensaje && <div className="mensaje" role="status">{mensaje}<button onClick={() => setMensaje("")}>×</button></div>}
      <form className="formulario" onSubmit={enviar}>
        <div className="encabezado-formulario"><div><p className="eyebrow">{editandoId ? "Edición" : "Nueva programación"}</p><h3>{editandoId ? "Editar función" : "Registrar función"}</h3></div>{editandoId && <button className="boton-texto" type="button" onClick={() => { setEditandoId(null); setDatos(inicial); }}>Cancelar</button>}</div>
        {error && <p className="alerta-error" role="alert">{error}</p>}
        {!peliculas.length && <p className="alerta-info">Primero debes registrar al menos una película.</p>}
        <div className="rejilla-formulario cuatro">
          <label className="campo"><span>Película</span><select value={datos.peliculaCodigo} onChange={(e) => setDatos({ ...datos, peliculaCodigo: e.target.value })}><option value="">Seleccione</option>{peliculas.filter((p) => p.estado === "disponible").map((p) => <option value={p.codigo} key={p.codigo}>{p.nombre}</option>)}</select></label>
          <label className="campo"><span>Sala</span><select value={datos.salaId} onChange={(e) => setDatos({ ...datos, salaId: e.target.value })}><option value="">Seleccione</option>{salas.map((s) => <option value={s.id} key={s.id}>{s.nombre}</option>)}</select></label>
          <label className="campo"><span>Fecha</span><input type="date" value={datos.fecha} onChange={(e) => setDatos({ ...datos, fecha: e.target.value })} /></label>
          <label className="campo"><span>Hora</span><input type="time" value={datos.hora} onChange={(e) => setDatos({ ...datos, hora: e.target.value })} /></label>
        </div>
        <button disabled={!peliculas.length} className="boton-primario" type="submit">{editandoId ? "Guardar cambios" : "Registrar función"}</button>
      </form>
      <div className="panel tabla-contenedor">
        {funciones.length ? <table><thead><tr><th>Película</th><th>Sala</th><th>Fecha</th><th>Hora</th><th>Acciones</th></tr></thead><tbody>{funciones.map((f) => <tr key={f.id}><td><strong>{nombrePelicula(f.peliculaCodigo)}</strong></td><td>{nombreSala(f.salaId)}</td><td>{new Date(`${f.fecha}T12:00:00`).toLocaleDateString("es-SV")}</td><td>{f.hora}</td><td className="acciones-tabla"><button onClick={() => prepararEdicion(f)}>Editar</button><button className="peligro" onClick={() => eliminar(f)}>Eliminar</button></td></tr>)}</tbody></table> : <div className="estado-vacio"><span>🕒</span><h3>Aún no hay funciones</h3><p>Registra una película y programa su primera función.</p></div>}
      </div>
    </section>
  );
}
