# BlogReddit — Frontend

Interfaz web para la API BlogReddit. Diseño DECAY—84: estética brutalista inspirada en skate culture, street art y zines de los 80s.

---

## Stack

| Herramienta | Versión | Para qué sirve |
|---|---|---|
| React | 19 | UI con componentes |
| Vite | 8 | Bundler + dev server |
| Tailwind CSS | v4 | Sistema de diseño (CSS vars + @theme) |
| React Router | v7 | Navegación entre páginas |
| TanStack React Query | v5 | Fetching, caché y mutaciones |
| Axios | latest | Cliente HTTP con interceptores JWT |

---

## Estructura

```
blogreddit-frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── api/
    │   └── axios.js          # Instancia Axios + JWT auto-refresh
    ├── context/
    │   └── AuthContext.jsx   # Estado global de autenticación
    ├── components/
    │   ├── Navbar.jsx        # Barra superior sticky con logo DECAY—84
    │   ├── Footer.jsx        # Footer con links, autor y paleta de colores
    │   ├── HeroStrip.jsx     # Banner oscuro con heading brutalista
    │   ├── PostCard.jsx      # Card con sombra brutal, rotación y tilt 3D
    │   ├── VoteButtons.jsx   # Botones up/down estilo brutalista
    │   ├── SortTabs.jsx      # Tabs NUEVO / TOP / HOT
    │   ├── TagBadge.jsx      # Sticker de categoría con sombra offset
    │   ├── Sidebar.jsx       # Perfil, comunidad, tags, quote
    │   ├── ParticleCanvas.jsx# Canvas con partículas y repulsión al cursor
    │   └── GrainOverlay.jsx  # No-op (grain manejado por CSS)
    └── pages/
        ├── Home.jsx          # Feed con hero, búsqueda, sort y sidebar
        ├── Login.jsx         # Terminal de acceso
        ├── Register.jsx      # Registro de nuevo miembro
        ├── CreatePost.jsx    # Editor de post con tab oscuro
        └── PostDetail.jsx    # Post completo + comentarios
```

---

## Diseño — DECAY—84

Paleta de colores del sistema:

| Variable | Hex | Uso |
|---|---|---|
| `--ink` | `#111008` | Fondo oscuro, borders, sombras |
| `--acid` | `#6DC800` | Acento principal verde ácido |
| `--rust` | `#E8420A` | Acento secundario naranja/rojo |
| `--amber` | `#F0B800` | Acento dorado |
| `--steel` | `#1A6EC0` | Acento azul |
| `--teal` | `#0A9E88` | Acento verde agua |
| `--wall` | `#F2EFE8` | Fondo claro (como pared de concreto) |
| `--paper` | `#FDFCF8` | Fondo de cards (papel envejecido) |

Tipografías:
- **Space Grotesk** — headings, labels, botones
- **Lora (italic)** — títulos de posts, citas
- **JetBrains Mono** — metadata, tags, UI técnica
- **DM Sans** — cuerpo de texto

Elementos característicos:
- Sombras brutales `5px 5px 0 #111008`
- Grain texture animado sobre toda la UI (CSS SVG filter)
- Partículas en canvas con repulsión al cursor
- Cards con rotación aleatoria sutil y tilt 3D en hover
- Ghost number "84" en hero y sidebar
- Animación `slamIn` de entrada escalonada

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev
```

Requiere el backend Django corriendo en `http://localhost:8000`.

---

## Conexión con el backend

El frontend se conecta a la API en `http://localhost:8000/api/`.
El archivo `src/api/axios.js` maneja:
- Token JWT en cada request (`Authorization: Bearer <token>`)
- Refresh automático del access token al expirar
- CORS configurado en el backend para `localhost:5173`

---

## Páginas

| Ruta | Página | Auth |
|---|---|---|
| `/` | Feed de posts con hero y sidebar | No |
| `/login` | Login con JWT | No |
| `/register` | Registro de usuario | No |
| `/create` | Crear nuevo post | Sí |
| `/posts/:id` | Post completo + comentarios + votos | Parcial |

---

*Construido por @xXlAlackXx — DECAY—84 Edition*
