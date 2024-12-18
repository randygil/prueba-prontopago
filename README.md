# Prueba Técnica - API RestFull Simple

## Descripción

Esta es una API RestFull desarrollada como parte de una prueba técnica para ProntoPago. La API permite gestionar citas médicas, incluyendo la creación, pago, confirmación y listado de citas. La API está desarrollada utilizando NestJS, PostgreSQL y Prisma para la gestión de la base de datos.

## Funcionalidades

- **Paciente**:

  - Pedir cita médica.
  - Pagar cita para confirmar asistencia.
  - Listar sus citas.

- **Médico**:
  - Confirmar cita (validando que la cita esté pagada).
  - Listar sus citas del día.
  - Gestionar sus citas.

## Validaciones

- No se puede pedir cita en un horario no permitido (7:00 - 12:00, 14:00 - 18:00).
- No se puede pedir cita en un horario ya ocupado.
- No se puede confirmar una cita que no ha sido pagada.

## Seguridad y Autenticación

Se implementa un sistema de autenticación simple utilizando tokens JWT.

## Usuarios de prueba

El seed contiene 2 usuarios de prueba:

- Paciente: paciente@prontopago.com - 12345678
- Doctor: medico@prontopago.com - 12345678

## Base de Datos

Se utiliza PostgreSQL como base de datos. Prisma se encarga de la gestión de la base de datos.

## Requisitos

- Node.js v20.15.0
- Docker (opcional, para ejecutar PostgreSQL y pgAdmin)

## Instalación

1. Clonar el repositorio:

```sh
git clone https://github.com/randygil/prueba-prontopago
cd https://github.com/randygil/prueba-prontopago
```

2. Instalar las dependencias:

```sh
yarn install
```

3. Configurar las variables de entorno:

Crear un archivo [`.env`](.env) en la raíz del proyecto con el siguiente contenido:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinica
PORT=3000
APP_KEY=your_app_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
```

4. Levantar los servicios de PostgreSQL y pgAdmin utilizando Docker:

```sh
docker-compose up -d
```

5. Ejecutar las migraciones de Prisma:

```sh
npx prisma migrate dev
```

6. Ejecutar el seeder para poblar la base de datos con datos iniciales:

```sh
yarn seed
```

## Ejecución

Para ejecutar el proyecto en modo desarrollo:

```sh
yarn start:dev
```

Para ejecutar el proyecto en modo producción:

```sh
yarn run build
yarn run start:prod
```

## Pruebas

Para ejecutar las pruebas unitarias:

```sh
yarn test
```

## Documentación

La documentación de la API está disponible en el endpoint `/docs` una vez que el servidor esté en funcionamiento.

```

```
