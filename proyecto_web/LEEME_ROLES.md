# Documentación del Proyecto: Roles y Control de Acceso
Materia: Sistemas 1 & Programación 3

---

### 1. Definición de Roles y Usuarios

Para este sistema se definieron tres roles con diferentes niveles de responsabilidad y acceso:

| Rol | Usuario | Clave | Nivel de Acceso | Descripción en el Sistema |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `1234` | Total | Puede ver todos los registros, agregar nuevos registros, eliminar registros existentes y ver el módulo exclusivo de gestión de usuarios. |
| **Operador** | `operador` | `1234` | Operativo | Puede ver los registros y agregar nuevos mediante el formulario. No puede eliminar registros ni ver la lista de usuarios. |
| **Consulta** | `consulta` | `1234` | Lectura | Solo puede visualizar los registros. No puede agregar información ni eliminar nada (modo solo lectura). |

---

### 2. Cómo funciona el código (Explicación para clase)

1. **Pantalla de Login (`index.html` y `login.js`):**
   - El usuario ingresa su nombre de usuario y contraseña.
   - El script valida primero que los campos no estén vacíos.
   - Busca en el arreglo de usuarios guardado en `localStorage`.
   - Si las credenciales coinciden, guarda un objeto con los datos del usuario en `sessionStorage` (llamado `usuario_activo`) y lo redirige a `inicio.html`.
   - Si se equivoca, muestra un mensaje de error en pantalla.

2. **Pantalla Principal (`inicio.html` y `inicio.js`):**
   - **Protección de página:** Al cargar, comprueba si existe `usuario_activo` en `sessionStorage`. Si alguien intenta entrar a `inicio.html` sin haber pasado por el login, el script lo devuelve automáticamente a `index.html`.
   - **Identificación:** Lee el nombre y el rol del usuario conectado y los coloca en la barra superior y en el mensaje de bienvenida.
   - **Control de Permisos (`aplicarPermisos`):** Según el rol del usuario, utiliza clases CSS (`.oculto`) para mostrar u ocultar:
     - El botón de "Eliminar" en la tabla.
     - El formulario de "Agregar Nuevo Registro".
     - La tarjeta de "Control de Usuarios del Sistema".
   - **Cierre de sesión:** Al presionar "Cerrar Sesión", borra el `sessionStorage` y regresa al login.

3. **Pantalla de Registro (`registro.html` y `registro.js`):**
   - Permite crear una nueva cuenta con nombre completo, usuario, contraseña (con confirmación) y rol asignado.
   - Valida que las contraseñas coincidan y que el usuario no exista previamente en el sistema.
   - Guarda el nuevo usuario en `localStorage` (`usuarios_sistema`) para que pueda iniciar sesión de inmediato.
   - También accesible directamente desde el panel para el Administrador.
