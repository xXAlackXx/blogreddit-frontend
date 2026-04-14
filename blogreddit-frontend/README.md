# BlogReddit — Frontend

Interfaz web para la API BlogReddit. Diseño DECAY—84: estética neobrutalist inspirada en skate culture, street art y zines de los 80s.

---

## Live Demo

| Servicio | URL |
|---------|-----|
| Frontend (Vercel) | `https://blogreddit-frontend-an47.vercel.app` |
| Backend API (Render) | `https://blogreddit-api.onrender.com` |

---

## Stack

| Herramienta | Versión | Para qué sirve |
|---|---|---|
| React | 19 | UI con componentes |
| Vite | 8 | Bundler + dev server |
| React Router | v7 | Navegación entre páginas con `location.state` |
| TanStack React Query | v5 | Server state, caché, mutaciones, paginación infinita |
| Axios | 1.x | Cliente HTTP con interceptores JWT y auto-refresh |
| react-easy-crop | 5.x | Crop circular de avatares antes de subir |
| DOMPurify | 3.x | Sanitización XSS en contenido markdown |

---

## Estructura

```
blogreddit-frontend/
├── public/
│   └── favicon.svg               # Logo ONYX SVG
├── vercel.json                   # Security headers: CSP, HSTS, X-Frame-Options
└── src/
    ├── api/
    │   └── axios.js              # Instancia Axios + JWT auto-refresh con interceptores
    ├── context/
    │   ├── AuthContext.jsx       # Estado global de autenticación, login/logout, refreshUser
    │   └── ThemeContext.jsx      # Tema dinámico por usuario (colores, fuentes, modo oscuro)
    ├── components/
    │   ├── Navbar.jsx            # Logo SVG ONYX, botón ⚡ CMD solo para admins
    │   ├── Footer.jsx            # Footer con logo, links y créditos
    │   ├── PostCard.jsx          # Card de post en el feed con sombra brutal
    │   ├── VoteButtons.jsx       # Up/downvote con toggle y cambio de sentido
    │   ├── AvatarCropModal.jsx   # Modal de crop circular con zoom (react-easy-crop)
    │   ├── ParticleCanvas.jsx    # Canvas con partículas y repulsión al cursor
    │   └── GrainOverlay.jsx      # Grain texture sobre la UI
    └── pages/
        ├── Home.jsx              # Feed con búsqueda, sorting y sidebar
        ├── AuthPage.jsx          # Login + Registro en una sola página con tabs
        ├── CreatePost.jsx        # Editor con soporte markdown e imagen opcional
        ├── PostDetail.jsx        # Post + comentarios paginados + botón back contextual
        ├── Profile.jsx           # Perfil propio: avatar, bio, tema personalizable
        ├── PublicProfile.jsx     # Perfil público /u/:username (read-only)
        └── AdminPanel.jsx        # Panel de administración (solo role=admin)
```

---

## Features

### Autenticación
- Login y registro con JWT (access 30min + refresh 1 día)
- Interceptor de Axios que renueva el access token automáticamente al expirar
- Redirect automático a `/login` para rutas protegidas

### Perfiles y temas
- Perfil propio editable: avatar + bio
- **Crop modal circular** para ajustar la foto antes de subirla
- GIFs se saltean el crop (el canvas rompe la animación)
- **Theme editor** integrado en el perfil: accent color, banner, fuente, efectos (glow, border), mood status
- Perfiles públicos en `/u/:username` — misma estética, solo lectura
- Sistema de karma y ranking: RECRUIT → ROOKIE → REGULAR → VETERAN

### Posts y comentarios
- CRUD de posts con imagen opcional (JPEG/PNG/GIF/WEBP, máx 5 MB)
- Editor con soporte markdown sanitizado con DOMPurify (anti-XSS)
- Comentarios paginados con **`useInfiniteQuery`** — "Load More" sin perder el estado de scroll
- Postear un comentario invalida todas las páginas cargadas, no solo la primera
- Sistema de votos up/down con toggle y cambio de sentido

### Navegación contextual
- Botón **← Back** en PostDetail se adapta al origen:
  - Feed → `← BACK TO FEED`
  - Perfil propio → `← BACK TO MY PROFILE`
  - Perfil público → `← BACK TO [USERNAME]'S PROFILE`
- Implementado con `location.state` de React Router (sin query params)

### Panel de administración
- Accesible en `/admin-panel` solo si `role = admin`
- Estadísticas globales, listado de posts/comentarios, eliminación de cualquier contenido
- Botón ⚡ CMD en el navbar solo visible para admins

---

## Diseño — DECAY—84

Paleta de colores:

| Color | Hex | Uso |
|---|---|---|
| Acid green | `#6DC800` | Acento principal |
| Rust | `#E8420A` | Acento secundario / destructivo |
| Amber | `#F0B800` | Acento dorado |
| Steel | `#1A6EC0` | Acento azul |
| Teal | `#0A9E88` | Acento verde agua |
| Ink | `#111008` | Fondo oscuro, borders, sombras |
| Wall | `#F2EFE8` | Fondo modo claro |

Tipografías:
- **Space Grotesk** — headings, labels, botones
- **Lora (italic)** — títulos de posts
- **JetBrains Mono** — metadata, tags, UI técnica
- **DM Sans** — cuerpo de texto

Elementos característicos:
- Sombras brutales sólidas `5px 5px 0 #111008`
- Grain texture sobre toda la UI
- Partículas en canvas con repulsión al cursor
- Animación `slamIn` de entrada escalonada
- Modo oscuro / claro con ThemeContext

---

## Instalación local

```bash
npm install
npm run dev
```

Requiere el backend Django corriendo en `http://localhost:8000`.  
Configurar `VITE_API_URL=http://localhost:8000/api` en `.env`.

---

## Variables de entorno

```env
VITE_API_URL=https://tu-api.onrender.com/api
```

---

## Páginas

| Ruta | Página | Auth |
|---|---|---|
| `/` | Feed con búsqueda, sorting y sidebar | No |
| `/login` | Login + Registro | No |
| `/create` | Crear nuevo post | Sí |
| `/posts/:id` | Post + comentarios paginados + votos | Parcial |
| `/profile` | Perfil propio + editor de tema | Sí |
| `/u/:username` | Perfil público (read-only) | No |
| `/admin-panel` | Panel de administración | Admin |

---

*Construido por @xXAlackXx — DECAY—84 Edition*
