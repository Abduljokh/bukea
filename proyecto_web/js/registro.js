// ==========================================================
// registro.js - Registro de nuevos usuarios en el sistema
// ==========================================================

// Lista base de respaldo por si el usuario abre registro.html directamente
const usuariosPorDefecto = [
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

if (!localStorage.getItem("usuarios_sistema")) {
  localStorage.setItem("usuarios_sistema", JSON.stringify(usuariosPorDefecto));
}

document.addEventListener("DOMContentLoaded", function () {
  const formRegistro = document.getElementById("form-registro");
  const txtNombre = document.getElementById("txt-nombre");
  const txtUsuario = document.getElementById("txt-usuario");
  const txtClave = document.getElementById("txt-clave");
  const txtClave2 = document.getElementById("txt-clave2");
  const cmbRol = document.getElementById("cmb-rol");

  const divError = document.getElementById("mensaje-error");
  const divExito = document.getElementById("mensaje-exito");

  formRegistro.addEventListener("submit", function (e) {
    e.preventDefault();
    divError.style.display = "none";
    divExito.style.display = "none";

    const nombre = txtNombre.value.trim();
    const usuario = txtUsuario.value.trim().toLowerCase();
    const clave = txtClave.value.trim();
    const clave2 = txtClave2.value.trim();
    const rol = cmbRol.value;

    // 1. Validar que no haya campos vacios
    if (nombre === "" || usuario === "" || clave === "" || clave2 === "") {
      divError.textContent = "Por favor, completa todos los campos.";
      divError.style.display = "block";
      return;
    }

    // 2. Validar que las contraseñas coincidan
    if (clave !== clave2) {
      divError.textContent = "Las contraseñas no coinciden. Inténtalo de nuevo.";
      divError.style.display = "block";
      return;
    }

    // 3. Validar longitud minima
    if (clave.length < 4) {
      divError.textContent = "La contraseña debe tener al menos 4 caracteres.";
      divError.style.display = "block";
      return;
    }

    // 4. Obtener usuarios actuales y validar que el nombre de usuario no este repetido
    const listaUsuarios = JSON.parse(localStorage.getItem("usuarios_sistema")) || [];

    const usuarioExiste = listaUsuarios.some(function (u) {
      return u.usuario.toLowerCase() === usuario;
    });

    if (usuarioExiste) {
      divError.textContent = "El nombre de usuario '" + usuario + "' ya está registrado. Elige otro.";
      divError.style.display = "block";
      return;
    }

    // 5. Generar descripcion del rol segun lo seleccionado
    let descripcionRol = "";
    if (rol === "Administrador") {
      descripcionRol = "Acceso total: puede ver, crear y eliminar registros y usuarios.";
    } else if (rol === "Operador") {
      descripcionRol = "Acceso operativo: puede ver y agregar nuevos registros, pero no eliminar.";
    } else {
      descripcionRol = "Solo lectura: únicamente puede ver la información registrada.";
    }

    // 6. Calcular nuevo ID secuencial
    const nuevoId = listaUsuarios.length > 0 
      ? Math.max(...listaUsuarios.map(u => u.id)) + 1 
      : 1;

    // 7. Crear el nuevo objeto usuario
    const nuevoUsuario = {
      id: nuevoId,
      usuario: usuario,
      clave: clave,
      nombre: nombre,
      rol: rol,
      descripcion: descripcionRol
    };

    // 8. Guardar en localStorage
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios_sistema", JSON.stringify(listaUsuarios));

    // 9. Mostrar exito y redireccionar al login
    divExito.textContent = "¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...";
    divExito.style.display = "block";
    formRegistro.reset();

    setTimeout(function () {
      window.location.href = "index.html";
    }, 1500);
  });
});
