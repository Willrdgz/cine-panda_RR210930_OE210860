"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  alternarSeleccionAsiento,
  limpiarSeleccionFuncion,
  ocuparAsientosFuncion,
} from "@/redux/slices/funcionesSlice";
import { confirmarReserva } from "@/redux/slices/reservasSlice";
import MapaAsientos from "./MapaAsientos";

export default function FormularioReserva() {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.items);
  const funciones = useAppSelector((state) => state.funciones.items);
  const salas = useAppSelector((state) => state.salas.items);
  const reservas = useAppSelector((state) => state.reservas.items);
  const [peliculaCodigo, setPeliculaCodigo] = useState("");
  const [salaId, setSalaId] = useState("");
  const [funcionId, setFuncionId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [nombreCliente, setNombreCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [erroresCliente, setErroresCliente] = useState<Record<string, string>>({});

  const pelicula = peliculas.find(({ codigo }) => codigo === peliculaCodigo);
  const funcionesPelicula = funciones.filter(
    (funcion) => funcion.peliculaCodigo === peliculaCodigo,
  );
  const salasDisponiblesIds = new Set(
    funcionesPelicula.map((funcion) => funcion.salaId),
  );
  const salasDisponibles = salas.filter((sala) => salasDisponiblesIds.has(sala.id));
  const funcionesDisponibles = funcionesPelicula.filter(
    (funcion) => funcion.salaId === salaId,
  );
  const funcion = funciones.find(({ id }) => id === funcionId);
  const seleccionados =
    funcion?.asientos.filter((asiento) => asiento.estado === "seleccionado") ?? [];
  const total = (pelicula?.precio ?? 0) * cantidad;

  useEffect(() => {
    if (funcionId) dispatch(limpiarSeleccionFuncion(funcionId));
  }, [cantidad, dispatch, funcionId]);

  const limpiarFuncionActual = () => {
    if (funcionId) dispatch(limpiarSeleccionFuncion(funcionId));
  };

  const confirmar = (evento: FormEvent) => {
    evento.preventDefault();
    setError("");
    const nuevosErrores: Record<string, string> = {};
    const nombreLimpio = nombreCliente.trim();
    const emailLimpio = emailCliente.trim().toLocaleLowerCase("es");
    const telefonoLimpio = telefonoCliente.trim();
    const digitosTelefono = telefonoLimpio.replace(/\D/g, "");

    if (!nombreLimpio) nuevosErrores.nombre = "Ingrese el nombre del cliente.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      nuevosErrores.email = "Ingrese un correo electrónico válido.";
    }
    if (digitosTelefono.length < 8 || digitosTelefono.length > 15) {
      nuevosErrores.telefono = "Ingrese un teléfono válido de 8 a 15 dígitos.";
    }
    if (Object.keys(nuevosErrores).length) {
      setErroresCliente(nuevosErrores);
      return;
    }
    setErroresCliente({});

    if (!pelicula || !salaId || !funcion) {
      setError("Seleccione película, sala y función.");
      return;
    }
    if (seleccionados.length !== cantidad) {
      setError(`Seleccione exactamente ${cantidad} asiento(s).`);
      return;
    }

    const asientosIds = seleccionados.map((asiento) => asiento.id);
    dispatch(
      confirmarReserva({
        id: crypto.randomUUID(),
        peliculaCodigo,
        funcionId,
        salaId,
        asientosIds,
        cantidadBoletos: cantidad,
        total,
        fechaCreacion: new Date().toISOString(),
        cliente: {
          nombre: nombreLimpio,
          email: emailLimpio,
          telefono: telefonoLimpio,
        },
      }),
    );
    dispatch(ocuparAsientosFuncion({ funcionId, asientosIds }));
    setMensaje(
      `Reserva confirmada: ${asientosIds.join(", ")} · Total $${total.toFixed(2)}`,
    );
    setFuncionId("");
    setSalaId("");
    setPeliculaCodigo("");
    setCantidad(1);
    setNombreCliente("");
    setEmailCliente("");
    setTelefonoCliente("");
  };

  const historial = useMemo(() => [...reservas].reverse(), [reservas]);
  const nombrePelicula = (codigo: string) =>
    peliculas.find((peliculaActual) => peliculaActual.codigo === codigo)?.nombre ??
    codigo;
  const nombreSala = (id: string) =>
    salas.find((salaActual) => salaActual.id === id)?.nombre ?? id;

  return (
    <section className="modulo">
      <div className="titulo-seccion">
        <div>
          <p className="eyebrow">Taquilla</p>
          <h2>Reserva de boletos</h2>
          <p>Selecciona película, sala, función y los asientos de la venta.</p>
        </div>
        <span className="contador">{reservas.length} reservas</span>
      </div>

      {mensaje && (
        <div className="mensaje" role="status">
          {mensaje}
          <button onClick={() => setMensaje("")} aria-label="Cerrar mensaje">×</button>
        </div>
      )}

      <form className="reserva-layout" onSubmit={confirmar}>
        <div className="formulario reserva-datos">
          <div className="encabezado-formulario">
            <div><p className="eyebrow">Paso 1</p><h3>Datos de la reserva</h3></div>
          </div>
          {error && <p className="alerta-error" role="alert">{error}</p>}

          <div className="subtitulo-formulario">
            <span aria-hidden="true">👤</span>
            <div><strong>Información del cliente</strong><small>Datos de contacto para la reserva</small></div>
          </div>

          <label className={`campo ${erroresCliente.nombre ? "campo-error" : ""}`}>
            <span>Nombre completo</span>
            <input
              autoComplete="name"
              placeholder="Nombre del cliente"
              value={nombreCliente}
              onChange={(evento) => {
                setNombreCliente(evento.target.value);
                setErroresCliente((actual) => ({ ...actual, nombre: "" }));
              }}
            />
            {erroresCliente.nombre && <small role="alert">{erroresCliente.nombre}</small>}
          </label>

          <label className={`campo ${erroresCliente.email ? "campo-error" : ""}`}>
            <span>Correo electrónico</span>
            <input
              autoComplete="email"
              placeholder="cliente@correo.com"
              type="email"
              value={emailCliente}
              onChange={(evento) => {
                setEmailCliente(evento.target.value);
                setErroresCliente((actual) => ({ ...actual, email: "" }));
              }}
            />
            {erroresCliente.email && <small role="alert">{erroresCliente.email}</small>}
          </label>

          <label className={`campo ${erroresCliente.telefono ? "campo-error" : ""}`}>
            <span>Teléfono</span>
            <input
              autoComplete="tel"
              placeholder="0000-0000"
              type="tel"
              value={telefonoCliente}
              onChange={(evento) => {
                setTelefonoCliente(evento.target.value);
                setErroresCliente((actual) => ({ ...actual, telefono: "" }));
              }}
            />
            {erroresCliente.telefono && <small role="alert">{erroresCliente.telefono}</small>}
          </label>

          <div className="subtitulo-formulario datos-funcion-subtitulo">
            <span aria-hidden="true">🎟️</span>
            <div><strong>Datos de la función</strong><small>Selecciona la película y los boletos</small></div>
          </div>

          <label className="campo">
            <span>Película</span>
            <select
              value={peliculaCodigo}
              onChange={(evento) => {
                limpiarFuncionActual();
                setPeliculaCodigo(evento.target.value);
                setSalaId("");
                setFuncionId("");
                setError("");
              }}
            >
              <option value="">Seleccione</option>
              {peliculas
                .filter((peliculaActual) => peliculaActual.estado === "disponible")
                .map((peliculaActual) => (
                  <option value={peliculaActual.codigo} key={peliculaActual.codigo}>
                    {peliculaActual.nombre}
                  </option>
                ))}
            </select>
          </label>

          <label className="campo">
            <span>Sala</span>
            <select
              disabled={!peliculaCodigo}
              value={salaId}
              onChange={(evento) => {
                limpiarFuncionActual();
                setSalaId(evento.target.value);
                setFuncionId("");
                setError("");
              }}
            >
              <option value="">Seleccione</option>
              {salasDisponibles.map((salaActual) => (
                <option value={salaActual.id} key={salaActual.id}>{salaActual.nombre}</option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Función</span>
            <select
              disabled={!salaId}
              value={funcionId}
              onChange={(evento) => {
                limpiarFuncionActual();
                setFuncionId(evento.target.value);
                setError("");
              }}
            >
              <option value="">Seleccione</option>
              {funcionesDisponibles.map((funcionActual) => {
                const libres = funcionActual.asientos.filter(
                  (asiento) => asiento.estado !== "ocupado",
                ).length;
                return (
                  <option value={funcionActual.id} key={funcionActual.id}>
                    {funcionActual.fecha} · {funcionActual.hora} · {libres} libres
                  </option>
                );
              })}
            </select>
          </label>

          <label className="campo">
            <span>Cantidad de boletos</span>
            <input
              min="1"
              max="10"
              type="number"
              value={cantidad}
              onChange={(evento) =>
                setCantidad(Math.max(1, Math.min(10, Number(evento.target.value))))
              }
            />
          </label>

          <div className="resumen-total">
            <span>Total a pagar</span>
            <strong>${total.toFixed(2)}</strong>
            <small>{cantidad} × ${(pelicula?.precio ?? 0).toFixed(2)}</small>
          </div>
          <button
            className="boton-primario"
            disabled={!funcion || seleccionados.length !== cantidad}
            type="submit"
          >
            Confirmar reserva
          </button>
        </div>

        <div className="panel asientos-panel">
          <div className="encabezado-formulario">
            <div><p className="eyebrow">Paso 2</p><h3>Selecciona {cantidad} asiento(s)</h3></div>
            <strong>{seleccionados.length}/{cantidad}</strong>
          </div>
          {funcion ? (
            <MapaAsientos
              asientos={funcion.asientos}
              cantidadMaxima={cantidad}
              alAlternar={(asientoId) =>
                dispatch(alternarSeleccionAsiento({ funcionId: funcion.id, asientoId }))
              }
            />
          ) : (
            <div className="estado-vacio">
              <span>💺</span><h3>Selecciona una función</h3>
              <p>Aquí aparecerá su mapa independiente de asientos.</p>
            </div>
          )}
        </div>
      </form>

      <div className="panel historial">
        <div className="encabezado-formulario">
          <div><p className="eyebrow">Actividad</p><h3>Reservas recientes</h3></div>
        </div>
        {historial.length ? (
          <div className="tabla-contenedor">
            <table>
              <thead><tr><th>Cliente</th><th>Película</th><th>Sala</th><th>Asientos</th><th>Boletos</th><th>Total</th><th>Fecha</th></tr></thead>
              <tbody>
                {historial.map((reserva) => (
                  <tr key={reserva.id}>
                    <td><strong>{reserva.cliente?.nombre ?? "Cliente no registrado"}</strong><small>{reserva.cliente?.email}</small></td>
                    <td><strong>{nombrePelicula(reserva.peliculaCodigo)}</strong></td>
                    <td>{nombreSala(reserva.salaId)}</td>
                    <td>{reserva.asientosIds.join(", ")}</td>
                    <td>{reserva.cantidadBoletos}</td>
                    <td>${reserva.total.toFixed(2)}</td>
                    <td>{new Date(reserva.fechaCreacion).toLocaleString("es-SV")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="texto-muted">Todavía no se han confirmado reservas.</p>
        )}
      </div>
    </section>
  );
}
