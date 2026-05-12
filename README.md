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

- Next.js 16 App Router
- Prisma 7 + Postgres (`@prisma/adapter-pg`)
- Server Actions
- Zod
- bcrypt
- Docker / Docker Swarm + Traefik

## Instalación local

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec prob npx prisma migrate deploy
```

Abrir:

```text
http://localhost:3010/install
```

## Deploy en VPS

Producción se opera en Docker Swarm detrás de Traefik. Ver [docs/INFRA.md](docs/INFRA.md)
para la guía completa (secretos, DNS, certs wildcard, rollback).

Resumen:

```bash
ssh <vps>
# /etc/dokploy/prob.env ya configurado con DATABASE_URL, AUTH_SECRET, CLOUDFLARE_*
export PROB_TAG=latest
docker stack deploy -c /etc/dokploy/prob/stack.yml --with-registry-auth prob
```

La imagen se construye en GitHub Actions (`.github/workflows/build.yml`) y se publica en
`ghcr.io/felixtron/prob` con tags `latest`, `sha-<short>`, `branch-<name>` y `vX.Y.Z`.

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
