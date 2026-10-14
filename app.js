"use strict";

const formulario = document.getElementById("formulario-registro");
const campoPassword = document.getElementById("password");
const campoConfirmacion = document.getElementById("confirmar-password");
const botonRegistro = document.getElementById("boton-registro");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "") {
    mensaje.textContent = texto;
    mensaje.className = "mensaje";

    if (tipo) {
        mensaje.classList.add(tipo);
    }
}

function obtenerToken() {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get("token");
}

function iniciarPagina() {
    const token = obtenerToken();

    // No habilitamos el formulario hasta verificar el token
    // mediante una función segura del servidor.
    campoPassword.disabled = true;
    campoConfirmacion.disabled = true;
    botonRegistro.disabled = true;

    if (!token) {
        mostrarMensaje(
            "No encontramos el código de invitación. " +
            "Abre el enlace completo que recibiste por correo.",
            "error"
        );
        return;
    }

    mostrarMensaje(
        "Recibimos el enlace de invitación. " +
        "Falta conectar la verificación segura con Supabase."
    );
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // El registro todavía no está conectado al servidor.
    mostrarMensaje(
        "El registro aún no está habilitado. " +
        "Todavía no se ha creado ninguna cuenta.",
        "error"
    );
});

iniciarPagina();