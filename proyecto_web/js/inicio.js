// ==========================================================
// inicio.js - Logica de la pantalla principal y control de roles
// ==========================================================

// Datos iniciales de registros si no existen en localStorage
const registrosIniciales = [
  {
    id: 101,
    titulo: "Revisión de inventario general",
    area: "Laboratorio A",
    fecha: "2026-11-04",
    estado: "Pendiente"
  },
  {
    id: 102,
    titulo: "Mantenimiento preventivo de equipos",
    area: "Sistemas",
    fecha: "2026-11-05",
    estado: "En Proceso"
  },
  {
    id: 103,
    titulo: "Actualización de software base",
    area: "Administración",
    fecha: "2026-11-05",
    estado: "Completado"
  }
];

if (!localStorage.getItem("registros_sistema")) {
  localStorage.setItem("registros_sistema", JSON.stringify(registrosIniciales));
}

document.addEventListener("DOMContentLoaded", function () {
  // 1. Verificamos que exista una sesion activa
  const sesionTexto = sessionStorage.getItem("usuario_activo");
  if (!sesionTexto) {
    alert("Acceso no autorizado. Debes iniciar sesión.");
    window.location.href = "index.html";
    return;
  }

  const usuarioActivo = JSON.parse(sesionTexto);

  // 2. Mostramos los datos del usuario en la barra superior
  document.getElementById("nombre-usuario").textContent = usuarioActivo.nombre;
  
  const spanRol = document.getElementById("rol-usuario");
  spanRol.textContent = usuarioActivo.rol;

  // Asignamos el estilo del rol segun corresponda
  if (usuarioActivo.rol === "Administrador") {
    spanRol.className = "badge-rol rol-admin";
  } else if (usuarioActivo.rol === "Operador") {
    spanRol.className = "badge-rol rol-operador";
  } else {
    spanRol.className = "badge-rol rol-consulta";
  }

  // Mensaje en la caja de bienvenida
  document.getElementById("bienvenida-nombre").textContent = usuarioActivo.nombre;
  document.getElementById("bienvenida-rol").textContent = usuarioActivo.rol;

  // 3. Aplicamos las reglas de permisos por rol
  aplicarPermisos(usuarioActivo.rol);

  // 4. Renderizamos las tablas
  cargarTablaRegistros(usuarioActivo.rol);
  if (usuarioActivo.rol === "Administrador") {
    cargarTablaUsuarios();
  }

  // 5. Configurar boton de cierre de sesion
  document.getElementById("btn-cerrar-sesion").addEventListener("click", function () {
    sessionStorage.removeItem("usuario_activo");
    window.location.href = "index.html";
  });

  // 6. Formulario para agregar registro (solo admin y operador)
  const formRegistro = document.getElementById("form-nuevo-registro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", function (e) {
      e.preventDefault();

      const titulo = document.getElementById("txt-titulo").value.trim();
      const area = document.getElementById("txt-area").value.trim();
      const estado = document.getElementById("cmb-estado").value;

      if (titulo === "" || area === "") {
        alert("Por favor completa los campos requeridos.");
        return;
      }

      const lista = JSON.parse(localStorage.getItem("registros_sistema"));
      const nuevoId = lista.length > 0 ? lista[lista.length - 1].id + 1 : 101;

      const nuevoRegistro = {
        id: nuevoId,
        titulo: titulo,
        area: area,
        fecha: new Date().toISOString().split("T")[0],
        estado: estado
      };

      lista.push(nuevoRegistro);
      localStorage.setItem("registros_sistema", JSON.stringify(lista));

      formRegistro.reset();
      cargarTablaRegistros(usuarioActivo.rol);
      alert("Registro guardado exitosamente.");
    });
  }
});

// Control de visibilidad segun el rol del usuario
function aplicarPermisos(rol) {
  const seccionAdmin = document.getElementById("seccion-admin");
  const seccionFormulario = document.getElementById("seccion-formulario");
  const descripcionPermisos = document.getElementById("descripcion-permisos");

  if (rol === "Administrador") {
    seccionAdmin.classList.remove("oculto");
    seccionFormulario.classList.remove("oculto");
    descripcionPermisos.textContent = "Tienes permisos de Administrador: puedes ver todo, agregar registros, eliminar elementos y consultar la lista de usuarios del sistema.";
  } else if (rol === "Operador") {
    seccionAdmin.classList.add("oculto");
    seccionFormulario.classList.remove("oculto");
    descripcionPermisos.textContent = "Tienes permisos de Operador: puedes ver la información y agregar nuevos registros al sistema. No tienes acceso a la lista de usuarios ni a eliminar registros.";
  } else {
    // Rol Consulta
    seccionAdmin.classList.add("oculto");
    seccionFormulario.classList.add("oculto");
    descripcionPermisos.textContent = "Tienes permisos de Consulta: tu cuenta está en modo solo lectura. Puedes revisar los registros existentes pero no puedes modificarlos ni eliminarlos.";
  }
}

// Cargar tabla principal de registros
function cargarTablaRegistros(rol) {
  const tbody = document.getElementById("tbody-registros");
  const lista = JSON.parse(localStorage.getItem("registros_sistema")) || [];

  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:15px; color:#64748b;">No hay registros cargados.</td></tr>';
    return;
  }

  lista.forEach(function (item) {
    const tr = document.createElement("tr");

    let columnaAccion = "";
    if (rol === "Administrador") {
      columnaAccion = `<td><button type="button" class="btn-eliminar" onclick="eliminarRegistro(${item.id})">Eliminar</button></td>`;
    } else {
      columnaAccion = '<td><span style="color:#94a3b8; font-size:12px;">Sin acción</span></td>';
    }

    tr.innerHTML = `
      <td><strong>#${item.id}</strong></td>
      <td>${item.titulo}</td>
      <td>${item.area}</td>
      <td>${item.fecha}</td>
      <td><span style="font-weight:600;">${item.estado}</span></td>
      ${columnaAccion}
    `;

    tbody.appendChild(tr);
  });
}

// Funcion para eliminar registro (exclusiva de admin)
function eliminarRegistro(id) {
  if (!confirm("¿Estás seguro de eliminar el registro #" + id + "?")) {
    return;
  }

  let lista = JSON.parse(localStorage.getItem("registros_sistema")) || [];
  lista = lista.filter(function (item) {
    return item.id !== id;
  });

  localStorage.setItem("registros_sistema", JSON.stringify(lista));
  cargarTablaRegistros("Administrador");
}

// Cargar la tabla de usuarios registrados (visible solo para Administrador)
function cargarTablaUsuarios() {
  const tbody = document.getElementById("tbody-usuarios");
  const listaUsuarios = JSON.parse(localStorage.getItem("usuarios_sistema")) || [];

  tbody.innerHTML = "";

  listaUsuarios.forEach(function (u) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td><strong>${u.usuario}</strong></td>
      <td>${u.nombre}</td>
      <td><span class="badge-rol ${u.rol === 'Administrador' ? 'rol-admin' : u.rol === 'Operador' ? 'rol-operador' : 'rol-consulta'}">${u.rol}</span></td>
      <td style="font-size:12px; color:#64748b;">${u.descripcion}</td>
    `;
    tbody.appendChild(tr);
  });
}
