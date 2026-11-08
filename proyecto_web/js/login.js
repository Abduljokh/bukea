// ==========================================================
// login.js - Control de acceso y validacion de usuarios
// ==========================================================

// Lista base de usuarios del sistema con sus respectivos roles
const usuariosRegistrados = [
  {
    id: 1,
    usuario: "admin",
    clave: "1234",
    nombre: "Juan Pérez",
    rol: "Administrador",
    descripcion: "Acceso total: puede ver, crear y eliminar registros y usuarios."
  },
  {
    id: 2,
    usuario: "operador",
    clave: "1234",
    nombre: "María García",
    rol: "Operador",
    descripcion: "Acceso operativo: puede ver y agregar nuevos registros, pero no eliminar."
  },
  {
    id: 3,
    usuario: "consulta",
    clave: "1234",
    nombre: "Carlos López",
    rol: "Consulta",
    descripcion: "Solo lectura: únicamente puede ver la información registrada."
  }
];

// Guardamos la lista en localStorage si aun no existe para que esté disponible en inicio.js
if (!localStorage.getItem("usuarios_sistema")) {
  localStorage.setItem("usuarios_sistema", JSON.stringify(usuariosRegistrados));
}

document.addEventListener("DOMContentLoaded", function () {
  // Si el usuario ya inicio sesion y no la ha cerrado, lo mandamos directo a inicio.html
  if (sessionStorage.getItem("usuario_activo")) {
    window.location.href = "inicio.html";
    return;
  }

  const formLogin = document.getElementById("form-login");
  const inputUsuario = document.getElementById("txt-usuario");
  const inputClave = document.getElementById("txt-clave");
  const divError = document.getElementById("mensaje-error");

  formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();
    divError.style.display = "none";

    const usuarioIngresado = inputUsuario.value.trim();
    const claveIngresada = inputClave.value.trim();

    // Validacion de campos vacios
    if (usuarioIngresado === "" || claveIngresada === "") {
      divError.textContent = "Debes llenar todos los campos.";
      divError.style.display = "block";
      return;
    }

    // Obtenemos los usuarios guardados
    const lista = JSON.parse(localStorage.getItem("usuarios_sistema"));

    // Buscamos si existe coincidencia de usuario y clave
    const usuarioValido = lista.find(function (u) {
      return u.usuario.toLowerCase() === usuarioIngresado.toLowerCase() && u.clave === claveIngresada;
    });

    if (usuarioValido) {
      // Guardamos los datos de la sesion activa en sessionStorage
      const datosSesion = {
        id: usuarioValido.id,
        usuario: usuarioValido.usuario,
        nombre: usuarioValido.nombre,
        rol: usuarioValido.rol
      };
      sessionStorage.setItem("usuario_activo", JSON.stringify(datosSesion));

      // Redireccionamos a la pantalla principal
      window.location.href = "inicio.html";
    } else {
      divError.textContent = "Usuario o contraseña incorrectos.";
      divError.style.display = "block";
    }
  });
});

// Funcion para facilitar pruebas en clase o defensa de proyecto
function autocompletar(user, pass) {
  document.getElementById("txt-usuario").value = user;
  document.getElementById("txt-clave").value = pass;
  document.getElementById("mensaje-error").style.display = "none";
}
