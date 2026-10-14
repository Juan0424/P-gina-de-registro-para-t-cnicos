
"use strict";

const URL_SUPABASE =
    "https://janqdxwwijivtwxpstmc.supabase.co";

const formulario = document.getElementById("formulario-registro");
const campoPassword = document.getElementById("password");
const campoConfirmacion = document.getElementById("confirmar-password");
const botonRegistro = document.getElementById("boton-registro");
const mensaje = document.getElementById("mensaje");

let tokenInvitacion = "";
let invitacionValida = false;
let enviando = false;

function mostrarMensaje(texto, tipo = "") {
    mensaje.textContent = texto;
    mensaje.className = "mensaje";
    if (tipo) mensaje.classList.add(tipo);
}

function bloquearFormulario() {
    invitacionValida = false;
    campoPassword.disabled = true;
    campoConfirmacion.disabled = true;
    botonRegistro.disabled = true;
}

function habilitarFormulario() {
    invitacionValida = true;
    campoPassword.disabled = false;
    campoConfirmacion.disabled = false;
    botonRegistro.disabled = false;
}

async function llamarFuncion(nombre, datos) {
    const respuesta = await fetch(
        `${URL_SUPABASE}/functions/v1/${nombre}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        }
    );

    const resultado = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            resultado.error || "No se pudo completar la solicitud."
        );
    }

    return resultado;
}

async function iniciarPagina() {
    bloquearFormulario();

    const parametros = new URLSearchParams(window.location.search);
    tokenInvitacion = parametros.get("token") || "";

    if (!tokenInvitacion) {
        mostrarMensaje(
            "No encontramos el código de invitación. Abre el enlace completo que recibiste por correo.",
            "error"
        );
        return;
    }

    mostrarMensaje("Verificando tu invitación...");

    try {
        const resultado = await llamarFuncion(
            "validar-invitacion",
            { token: tokenInvitacion }
        );

        if (resultado.valida !== true) {
            throw new Error("La invitación no es válida o ya fue utilizada.");
        }

        habilitarFormulario();
        mostrarMensaje(
            "¡Invitación válida! Ya puedes crear tu contraseña."
        );
    } catch (error) {
        bloquearFormulario();
        mostrarMensaje(
            error.message || "No se pudo verificar la invitación.",
            "error"
        );
    }
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    if (!invitacionValida || enviando) return;

    const password = campoPassword.value;
    const confirmacion = campoConfirmacion.value;

    if (password.length < 8 || password.length > 128) {
        mostrarMensaje(
            "La contraseña debe tener entre 8 y 128 caracteres.",
            "error"
        );
        return;
    }

    if (password !== confirmacion) {
        mostrarMensaje("Las contraseñas no coinciden.", "error");
        return;
    }

    enviando = true;
    botonRegistro.disabled = true;
    mostrarMensaje("Creando tu cuenta...");

    try {
        const resultado = await llamarFuncion(
            "registrar-tecnico",
            {
                token: tokenInvitacion,
                password: password
            }
        );

        if (resultado.ok !== true) {
            throw new Error(resultado.error || "No se pudo crear la cuenta.");
        }

        formulario.reset();
        bloquearFormulario();
        mostrarMensaje(
            "¡Tu cuenta se creó correctamente! Ya puedes iniciar sesión en la aplicación."
        );
    } catch (error) {
        mostrarMensaje(
            error.message || "No se pudo completar el registro. Inténtalo de nuevo.",
            "error"
        );
    } finally {
        enviando = false;

        if (invitacionValida) {
            botonRegistro.disabled = false;
        }
    }
});

iniciarPagina();
