# Logia

API de un sistema de gestión de stock, el mismo se modifica a través de la carga de comprobantes. El backend está en `back/`: Node.js, Express y TypeScript, con PostgreSQL y Prisma.

## Requisitos

- Node.js 20.19 o superior
- PostgreSQL en marcha


## Puesta en marcha

```bash
npm install
npx prisma generate
npm run db:migrate
npm run dev
```

`npm run db:migrate` ejecuta `prisma migrate deploy`. Crea las tablas y carga los datos iniciales. Hay que usar ese comando: `prisma db push` alinea el schema y no corre los `INSERT` de la migración.

Cuando cambie `prisma/schema.prisma`, generá una migración nueva:

```bash
npx prisma migrate dev --name describe-el-cambio
```


