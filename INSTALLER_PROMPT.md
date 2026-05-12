# Prompt base para replicar PROB

Convierte este proyecto Next.js en una plantilla instalable para bandas, artistas y agrupaciones.

Debe funcionar como un `install.exe` web: al abrir por primera vez, si no existe configuración global, redirige a `/install`, muestra un wizard de configuración inicial, crea el admin, guarda branding/datos de contacto/servicios/integraciones, inicializa la base y bloquea el instalador después de completarlo.

El wizard debe pedir datos generales de la agrupación, branding, redes, contacto, admin inicial, servicios/paquetes, datos bancarios, Stripe opcional, Evolution API opcional y Google Calendar opcional.

Implementa usando:

- Next.js App Router
- Prisma
- Server Actions
- Zod
- bcrypt
- Docker

El resultado debe permitir clonar este repo, desplegarlo en otro dominio/VPS y configurarlo desde cero sin editar código.
