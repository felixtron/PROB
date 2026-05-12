# PROB

PROB es una plantilla instalable para bandas, artistas, DJs, agencias y proyectos de entretenimiento.

La meta es que funcione como un **install.exe web**:

1. Clonas el proyecto.
2. Lo despliegas en un dominio.
3. Abres el sitio.
4. Si no hay instalación completada, la app redirige a `/install`.
5. Completas el wizard.
6. La app crea organización, branding, admin inicial, paquetes base, bancos, plantillas e integraciones opcionales.
7. `/install` queda bloqueado y el panel admin queda habilitado.

## Stack

- Next.js App Router
- Prisma 7 + SQLite/libSQL adapter
- Server Actions
- Zod
- bcrypt
- Docker / Docker Compose

## Instalación local

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Abrir:

```text
http://localhost:3010/install
```

## Deploy en VPS

```bash
git clone <repo> prob
cd prob
cp .env.example .env
openssl rand -base64 32
# pegar resultado en AUTH_SECRET
docker compose build
docker compose up -d
docker compose exec prob npx prisma db push --accept-data-loss
```

## Variables

```env
DATABASE_URL=file:./prisma/dev.db
AUTH_SECRET=replace-with-openssl-rand-base64-32
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
EVOLUTION_BASE_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=
```

## Wizard inicial

El wizard pide:

- Información general de la agrupación.
- Tipo de proyecto.
- Descripciones.
- Ubicación.
- Contacto.
- Redes sociales.
- Logo, hero y colores.
- Moneda y zona horaria.
- Admin inicial.
- Preset de paquetes.
- Datos bancarios.
- Stripe opcional.
- Evolution API opcional.
- Google Calendar opcional.

## Seguridad del instalador

- Si no hay instalación, la app redirige a `/install`.
- Si ya está instalada, `/install` redirige a `/admin`.
- El admin inicial se crea una sola vez.
- Contraseña con hash bcrypt.
- Validación con Zod.
- Secrets reales se configuran vía `.env`, no desde el cliente.

## Próximos módulos recomendados

- Auth completa con NextAuth.
- Panel de paquetes editable.
- CRUD de artistas/músicos.
- Cotizador público.
- Stripe Checkout.
- Evolution API webhooks.
- Export/import de configuración por JSON.
- Comando `npx create-prob-app` o script `install.sh`.
