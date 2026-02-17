# 🏓 Mccarren Tournament Management Web App

Una aplicación web completa para la gestión de torneos de tennis, construida con **Next.js 14**, **Supabase** y **Tailwind CSS**.

## ✨ Características Principales

- 🔐 **Autenticación completa** con roles (Jugador, Organizador, Admin)
- 🏆 **Gestión de torneos** con creación, registro y seguimiento
- 🎯 **Generación automática de brackets** con sistema de eliminación simple
- 👥 **Sistema de registro de jugadores** en torneos
- 📊 **Panel de organizador** para gestión completa
- 🎨 **Interfaz moderna** con diseño responsive

## 🚀 Inicio Rápido

### ⚡ Modo Desarrollador Actual (Sin Autenticación)

**La app está configurada en modo desarrollador** para facilitar el desarrollo. La autenticación está temporalmente desactivada.

### 1. Configurar Supabase
```bash
# Crear archivo .env.local en la raíz del proyecto
NEXT_PUBLIC_SUPABASE_URL="TU_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="TU_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"
```

### 2. Crear Base de Datos
- Ejecuta `mccarren_tournament_setup.sql` en tu panel de Supabase (SQL Editor)
- Ejecuta `setup_rls_and_functions.sql` para políticas RLS y funciones

### 3. Ejecutar la App
```bash
cd frontend
npm run dev
```

### 4. Acceder (Modo Desarrollador)
- **🏠 Home:** `http://localhost:3000` (accesos directos)
- **📊 Dashboard:** `http://localhost:3000/dashboard`
- **🏓 Panel Organizador:** `http://localhost:3000/organizer`
- **🧪 Probar Conexión:** `http://localhost:3000/test`

### Crear Jugadores de Prueba

Para probar la generación de brackets, ejecuta:

```bash
node execution/create-test-players.js
```

Esto crea 8 jugadores automáticamente y los registra en tu torneo más reciente.

### 🔐 Para Producción (Con Autenticación)
Cuando estés listo para producción, ejecuta:
```bash
node execution/create-admin-user.js  # Usuario confirmado automáticamente
```
O usa `http://localhost:3000/setup-admin` para registro con email.

## 🤖 Agent Workflow Architecture

This project follows a 3-layer architecture for AI agent operations:

1.  **Directives (`directives/`)**: Standard Operating Procedures (SOPs) defining "What to do".
2.  **Orchestration**: The AI agent reads directives and executes tools.
3.  **Execution (`execution/`)**: Deterministic scripts (JS/SQL) for performing tasks.

See `directives/README.md` for more details.

## Project Setup

### Supabase Project Setup

1.  **Create a New Supabase Project**: Go to [Supabase](https://app.supabase.io/) and create a new project.
2.  **Database Password**: Keep your database password safe.
3.  **Get your Project URL and anon key**: You'll need these for your frontend application.

### Local Development Setup (Conceptual)

This section will be expanded as we build out the frontend and any local development environment.

## Database Schema

✅ **TABLAS CREADAS** - Las 7 tablas con nombres `_mccarren_tournament` ya están en tu base de datos:

- `clubs_mccarren_tournament` - Clubs organizadores
- `tournaments_mccarren_tournament` - Torneos principales
- `tournament_players_mccarren_tournament` - Registro de jugadores
- `brackets_mccarren_tournament` - Llaves de torneos
- `matches_mccarren_tournament` - Partidos individuales
- `announcements_mccarren_tournament` - Anuncios del torneo
- `support_tickets_mccarren_tournament` - Sistema de soporte

**Owner:** `n8n_user` (como configuraste)

## Próximos Pasos

### 1. Ejecutar Políticas RLS y Funciones
Copia el contenido de `setup_rls_and_functions.sql` y pégalo en tu SQL Editor de Supabase.

### 2. Probar Conexión
Ve a `http://localhost:3000/test` y haz clic en "Test Supabase".

### 3. Crear tu Primer Torneo
Ve a `http://localhost:3000/organizer` para crear torneos.

### 4. Registrar Jugadores
Los jugadores pueden registrarse en `http://localhost:3000/tournaments`.

## Row Level Security (RLS) Policies (Conceptual)

This section will detail the RLS policies to be applied to each table to ensure data security and proper access control based on user roles.

-   **Players**:
    *   Can read `tournaments` they are registered in.
    *   Can read their `matches`.
    *   Can create `support_tickets`.
-   **Organizers/Admins**:
    *   Can create `tournaments`, `brackets`, `matches`, `announcements`.
    *   Can update `tournaments`, `matches`, `announcements`, `support_tickets` status.
    *   Can read all tournament-related data.

## Supabase Server Functions (Conceptual)

### 1. `generate_draw(tournament_id, seeding_mode)`

This function will generate a single-elimination draw with byes for a given `tournament_id` and `seeding_mode`.

### 2. `report_score(match_id, score_text, winner_id)`

This function will report the score for a `match_id`, set the `winner_id`, and automatically advance the winner to the next match in the bracket.

