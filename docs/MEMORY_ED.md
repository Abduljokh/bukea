# MEMORY ED — PROYECTO BUKEA

> **Proyecto:** BUKEA (Ecosistema Digital de Reservas de Estatus, Inmersión Espacial 360°, Menús AR, Chips NFC y Suite POS/KDS)  
> **Usuario / Lead:** Ed (Metro Virtual Tours)  
> **Rol Asignado:** Rol 4 — Frontend User & QA Specialist  
> **Rama Oficial:** `feat/rol4-user-ui` (REGLA: NUNCA push directo a `main`)  
> **Repositorio GitHub:** [https://github.com/RAFAELREYESDEV/bukea.git](https://github.com/RAFAELREYESDEV/bukea.git)  
> **Producción Cloudflare:** [https://bukea.inkbytecorpore.workers.dev](https://bukea.inkbytecorpore.workers.dev)  
> **Notion Maestro:** [Bookea o Bookealo](https://leaf-ceder-624.notion.site/Bookea-o-Bookealo-3f4d9083836280f699d9d6fb243f6819)

---

## 1. REGLAS DE ORO DE DISEÑO & IDENTIDAD VISUAL

1. **Nombre de Marca:**
   - **BUKEA** (en mayúsculas o capitalizado Bukea). Se descartó formalmente el nombre anterior *Bookealo* o *Bookea*.
2. **Tema Blanco Puro (Light Mode):**
   - Fondo blanco y neutros muy suaves (`#ffffff`, `#fbfbfb`, `#f8f9fa`).
   - Textos con contraste en negro sólido y grises oscuros (`#0A0A0A`, `#171717`, `#404040`, `#737373`).
   - Cero temas oscuros de fondo negro/dorado.
3. **Cero Degradados / Gradients:**
   - Prohibidos los gradientes de color o efectos metálicos dorados.
   - Uso exclusivo de **Liquid Glass / Glassmorphism**: fondos translúcidos, `backdrop-blur-md`, bordes finos `border-black/10` y sombras difusas de alta gama.
4. **Cero Emojis:**
   - Ningún emoji en títulos, botones, badges ni descripciones.
   - Uso 100% de iconografía vectorial minimalista con `lucide-react`.
5. **Badges Minimalistas:**
   - Insignias sobrias, discretas y limpias, evitando el aspecto artificial o sobrecargado típico de plantillas de IA.
6. **Sistema Tipográfico Oficial:**
   - **LOGO:** `Story Script` (cursiva de autor con personalidad).
   - **TEXTO & UI:** `Barlow` (sans-serif moderna, geométrica y de máxima legibilidad móvil).
   - **ACENTO / ÉNFASIS:** `Cormorant Garamond` (serif editorial para remates de títulos y frases de estatus).

---

## 2. ARQUITECTURA DE PANTALLAS (FRONTEND USER)

### A. Página Principal (`web/app/page.tsx`)
- **Header Liquid Glass:**
  - Logo `Bukea` en tipografía Story Script.
  - **Selector Dinámico de Ubicación / Destino:**
    - Botón interactivo con icono `MapPin`, destino actual y flecha `ChevronDown`.
    - Al pulsar, abre modal de selección con geodetección GPS (`navigator.geolocation`).
    - Destinos: **Margarita** (*Pampatar, Playa El Agua, Porlamar*), **Caracas** (*Las Mercedes, Altamira, El Hatillo*), **Lechería** y **Los Roques**.
    - Persistencia en `localStorage` (`bukea_user_location`).
  - Acceso directo a *Pase Digital*.
- **Hero Editorial:**
  - Tagline: *"Reservas exclusivas, en un toque."* (con *"en un toque"* en tipografía Cormorant Garamond itálica).
  - Subtítulo de estatus: Tours virtuales 360°, platos en Realidad Aumentada y acceso preferencial.
- **Feed Táctil de Locales:**
  - Buscador en tiempo real por nombre, cocina o zona.
  - Filtros de categoría (*Todos, Beach Clubs, Posadas, Terrazas*).
  - Filtros de tecnología (*Tours 360°* y *Platos AR*).
  - Tarjetas de local con rating seguro, foto hero, perks de mesa y horario.
- **Dock de Navegación Inferior (`BottomNav.tsx`):**
  - Flotante tipo liquid glass con 4 vistas: *Explorar, Mapa interactivo, Mis Reservas* (con contador en vivo) y *Pase Digital Wallet*.

### B. Detalle del Restaurante (`web/app/lugar/[id]/page.tsx`)
- **Co-Branding Oficial ("Bukea x [Restaurante]"):**
  - En las páginas de los locales, tanto la barra superior (Topbar) como el título de la tarjeta principal deben mostrar obligatoriamente el logo de **Bukea** (con tipografía oficial Story Script) + signo de colaboración **×** + el **nombre del restaurante** (ejemplo: *Bukea x Sakay*, *Bukea x Downtown Beach Club*).
  - El título de la pestaña del navegador también se actualiza dinámicamente como `Bukea × [Nombre]`.
- **Encabezado Gastronómico Obligatorio:**
  - Dice obligatoriamente **"Comida [TIPO]"** (e.g. *Comida Árabe, Comida Mexicana, Comida Italiana, Comida Fusión Insular*), nunca la palabra genérica "Restaurante".
- **Barra de Botones de Acción (CTAs Oficiales):**
  - **1. Ver Menú:** Abre la carta digital interactiva estilo PedidosYa (con buscador en tiempo real, categorías con conteo, tarjetas limpias con fotos y precios, y modal bottom-sheet con ingredientes y botón para reservar).
  - **2. Reservar:** **Destacado usando color negro** (`bg-black text-white hover:bg-neutral-800`), sobresaliendo visualmente del resto de acciones. Desplaza suavemente al motor de reserva de la mesa.
  - **3. Tour 360:** Acceso directo al visor inmersivo 360° en pantalla completa.
  - **4. WhatsApp:** Apertura de chat directo con mensaje personalizado de reserva y consulta.
  - **Dock Flotante Fijo:** Se replica como barra flotante fija inferior tipo vidrio líquido para acceso táctil permanente mientras se navega por el local.
- **Platos en Realidad Aumentada (AR):**
  - **Siempre muestra 4 platos fijos iniciales** en rejilla.
  - Botón expansible **"Ver más platos AR"** / **"Ver menos"** si la carta contiene más platos 3D.
  - Modal con visor 3D interactivo `<model-viewer>` para girar en 360° o proyectar en la mesa física con WebXR.
- **Motor de Reservas Instantáneo:**
  - Selector de comensales (1 a 8+ personas).
  - Selector de fecha con validación de días pasados.
  - Franjas horarias con disponibilidad en tiempo real.
  - Formulario de nombre y WhatsApp.
  - Generación de código VIP (ej: `BK-89X2`) y guardado persistente en `localStorage` (`bukea_reservations`).
- **Tour Virtual 360°:**
  - Modal inmersivo a pantalla completa para recorrer el local antes de reservar.
- **Menú Digital Completo (`MenuDigital.tsx`):**
  - Secciones: *Entradas, Del Mar, Parrilla, Postres*.
  - Bottom-sheet con detalle de ingredientes y precios.
- **Opiniones Verificadas (`ReviewsList.tsx`):**
  - Reseñas de comensales con distintivo de verificación.

---

## 3. RESILIENCIA DE DATOS Y CONEXIÓN CON BACKEND

- **Capa de Normalización (`web/app/data/businesses.ts`):**
  - Consume `/api/web/businesses` del backend Fastify (Rol 3) si está en ejecución.
  - La función `normalizeBusiness()` complementa automáticamente imágenes temáticas de Unsplash, coordenadas de Margarita, descripciones y perks si la base de datos viene vacía o incompleta.
  - La función `formatCuisineHeader()` asegura la regla de "Comida [TIPO]".
  - Previene caídas por `rating.toFixed()` mediante coalescencia nula `(b.rating ?? 4.8).toFixed(1)`.

---

## 4. COMANDOS Y GUÍA TÉCNICA DEL ENTORNO

### Servidor Local de Desarrollo
```bash
# Directorio del proyecto web
cd "/Volumes/EDS 2TB SSD/Antigravity/Bukea/web"

# Levantar servidor en puerto 3000 expuesto a la red local (para pruebas en móviles)
npx next dev -H 0.0.0.0 -p 3000
```
URL local: **http://localhost:3000**  
URL red Wi-Fi / Router (móviles): **http://192.168.1.2:3000**

> **⚠️ Regla de Estabilidad de UI:** NUNCA ejecutar `next build` mientras el servidor `next dev` esté corriendo en segundo plano, ya que Next.js sobreescribe la carpeta `.next/` con artefactos de producción y corrompe los hashes del CSS en caliente (provocando error 404 en los estilos y dejando la interfaz en HTML crudo). Si se requiere compilar, detener primero el proceso de desarrollo y luego reiniciar con `.next` limpio.

### Flujo de Git y GitHub
- **Cuenta autenticada:** `metroinmersion-rgb` vía GitHub CLI (`gh`).
- **Rama:** `feat/rol4-user-ui`.
- **Regla:** Nunca hacer push a `main`. Todo merge a `main` se realiza mediante Pull Request en GitHub.
- **Comandos estándar:**
  ```bash
  git add .
  git commit -m "feat(user-ui): <descripcion>"
  git push origin feat/rol4-user-ui
  ```

---

## 5. HISTORIAL DE COMMITS CLAVE

- `279bb2b`: Maqueta blanca liquid glass BUKEA, tipografías oficiales, badges minimalistas y memoria técnica.
- `7f5dfd6`: Selector interactivo de destino y autodetección de ubicación GPS.
- `6f3a33b`: Precarga optimizada de fuentes en layout y directiva limpia de Tailwind v4 en globals.css.
- `c333dbe`: Remoción de botones CTA duplicados del card de negocio, dejando los CTAs exclusivamente en el dock flotante inferior.
- `7127773`: Frosted glass sólido en el dock flotante (`rgba(255,255,255,0.94)`, blur 24px, borde y sombras nítidas) y remoción del botón 360° del dock (para integrarlo directamente en el primer slide del carrusel).
- `46a3d0f`: Reordenamiento del dock flotante con Reservar al centro (`[Ver Menú] | [Reservar] | [WhatsApp]`), remoción de campos de contacto del paso 1 de reserva y cambio de CTA a "Continuar con la Reserva".
- `295e6f3`: Implementación completa del Checkout Rápido con Accordion Stepper colapsable de 3 pasos (`CheckoutStepper.tsx`), Escudo Anti-Spam (Abono $1 USD / Puntos Bukea), métodos C2P Débito Inmediato y Pago Móvil Directo con timer de mesa retenida.
- `18b5577`: Documentación del Checkout Stepper colapsable y Escudo Anti-Spam en memoria técnica.
- `3101820`: Configuración del servidor en puerto 3000 con escucha en todas las interfaces (`0.0.0.0`) e IP local `192.168.1.2` para pruebas en móviles.
- `26a7fe4`: Corrección de padding/overlap en inputs y selects, adición de Binance Pay y Stripe, separación de Identidad en dos campos (con opción Pasaporte condicional a Binance/Stripe) y actualización de política no reembolsable (crédito en mesa o Puntos Bukea $1 = 1 pto).
- `efe169b`: Erradicación total de emojis por Lucide icons, Scrollspy dinámico en carta/menú con dock de categorías sticky no cortado y renombre de pasos del Accordion Stepper (Información, Verificación y Pago).





