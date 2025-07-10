# 🧭 Next.js + TypeScript Code Style Guide

Esta guía define convenciones y buenas prácticas para mantener un código limpio, escalable y mantenible en este proyecto Next.js con TypeScript.

---

## ✨ Principios Generales

- **Escribe código que se lea como una historia.**
- **Nombra para entender, no para ahorrar caracteres.**
- **Aplica principios SOLID y DRY.**
- **Prefiere la composición antes que la herencia.**
- **Cada archivo debe tener una única responsabilidad clara.**

---

## 🧱 Estructura del Proyecto

```
/src
  /pages
  /components
  /services
  /lib
  /types
  /utils
  /middleware
  /api (si usas /src/app/api en Next.js 13+)
```

- `/pages` → solo para páginas Next.js (`route segments`)
- `/components` → componentes reutilizables (con carpetas propias si son complejos)
- `/services` → lógica de negocio, llamadas a APIs, integración con externos
- `/utils` → funciones utilitarias sin estado
- `/lib` → configuración y clientes de SDKs, DB, etc.
- `/types` → tipos globales, interfaces, enums
- `/middleware` → middlewares reutilizables de API
- `/api` → handlers de API o route handlers

---

## 🏷️ Nombres y Convenciones

- Archivos en kebab-case: `user-profile.tsx`, `api-client.ts`
- Componentes y clases en PascalCase: `UserCard`, `ProductService`
- Funciones y variables en camelCase: `fetchUserById`, `isValidEmail`
- Evita siglas crípticas: usa `customerData` en vez de `custDt`

---

## 🧼 Clean Code

- No uses `any` (excepto con `// @ts-expect-error` bien justificado).
- Divide funciones largas: cada función debe hacer solo **una cosa**.
- Prefiere `const` sobre `let`.
- Comenta solo para aclarar _por qué_, no _qué_.
- Usa early return para reducir anidación:

```ts
if (!user) return null;
```

- No uses `console.log` en producción. Usa `logger` si es necesario.

---

## ✅ Principios SOLID Aplicados

- **S - Single Responsibility:** un componente, servicio o función → una tarea clara.
- **O - Open/Closed:** código abierto a extensión, cerrado a modificación.
- **L - Liskov:** subtipos deben respetar el comportamiento esperado.
- **I - Interface Segregation:** crea interfaces específicas, no gigantes.
- **D - Dependency Inversion:** usa inyección de dependencias (ej. `constructor(private httpClient: IHttpClient)`).

---

## 🧪 Testing

- Usa `Jest` para pruebas unitarias.
- Cobertura mínima esperada: **90%**
- Nombra los archivos con `.spec.ts` o `.test.ts` y agrúpalos cerca del código.

Ejemplo:

```
/services/product.service.ts
/services/product.service.test.ts
```

---

## ⚙️ Lint & Format

- Usa ESLint + Prettier con configuración estricta.
- Activa `"strict": true` en `tsconfig.json`.
- Reglas clave (ESLint):
  - No `any`
  - No funciones anónimas innecesarias
  - Forzar tipado explícito
  - Imports ordenados

---

## 📦 Componentes React

- **Preferir componentes funcionales.**
- Usa `React.FC` solo si necesitas `children`.
- Usa hooks bien nombrados: `useFetchUser`, no `useData`.
- Props tipadas:

```ts
interface UserCardProps {
  name: string;
  avatarUrl?: string;
}

const UserCard = ({ name, avatarUrl }: UserCardProps) => <div>{name}</div>;
```

---

## 🔒 Seguridad

- Escapa contenido dinámico (`dangerouslySetInnerHTML` solo si es inevitable).
- Valida todos los datos externos, especialmente en endpoints API.
- Nunca confíes en valores del frontend sin validación del backend.

---

## 🌍 Buenas prácticas específicas de Next.js

- Usa `getServerSideProps` y `getStaticProps` solo cuando sea necesario.
- Prefiere `app/api` con route handlers (`GET`, `POST`, etc.) en Next.js 13+.
- Evita lógica pesada en el cliente.
- Usa `next/head` para metadata dinámica.
- Implementa loading y error boundaries en componentes importantes.

---

## 🔚 Ejemplo de servicio desacoplado

```ts
// services/UserService.ts
import { IHttpClient } from "@/interfaces/IHttpClient";

export class UserService {
  constructor(private http: IHttpClient) {}

  async getUser(id: string) {
    return this.http.get(`/api/users/${id}`);
  }
}
```

---

## 🧠 Tips Finales

- Si una función o componente no se puede entender en 10 segundos, divídelo.
- Si ves lógica duplicada más de 2 veces, extrae una utilidad.
- No "adivines" lo que hace una función. Nombrala mejor o documenta.

---

> 🤖 Esta guía está viva. Si detectas mejoras, crea un PR o sugiere cambios.

---

## 🔐 Seguridad

### 🧾 Validación y sanitización de entrada

- Valida todos los datos recibidos, incluso si provienen del frontend o cookies.
- Usa **Zod** o **Yup** para validar inputs en APIs y formularios.
- Sanitiza inputs si hay riesgo de inyección (ej. comentarios, HTML, parámetros de búsqueda).

```ts
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const body = userSchema.parse(req.body);
```

---

### 🛡️ Protección en endpoints API

- Nunca expongas lógica sensible o tokens en el frontend.
- Usa middlewares de autenticación/autorización para proteger rutas (`getServerSession`, JWT, headers).
- Devuelve errores genéricos (no reveles detalles del backend en errores).
- Aplica rate limiting (`upstash`, `next-rate-limit`, etc.).

---

### 🧼 Cross-Site Scripting (XSS)

- Escapa el contenido dinámico si se va a inyectar en el DOM.
- Usa `dangerouslySetInnerHTML` **solo si es absolutamente necesario**, y sanitiza con una librería como `dompurify`.

---

### 🌐 CSRF (Cross-Site Request Forgery)

- Si usas cookies como auth, activa protección CSRF (NextAuth ya lo maneja).
- Evita usar `GET` para acciones destructivas.

---

### 🔑 Seguridad en cookies y tokens

- Usa `httpOnly`, `secure` y `sameSite=strict` en las cookies.
- No guardes tokens sensibles en `localStorage` o `sessionStorage`.

```ts
res.setHeader(
  "Set-Cookie",
  `token=${jwt}; HttpOnly; Path=/; Secure; SameSite=Strict`
);
```

---

### 🌐 Cabeceras de seguridad (HTTP headers)

- Usa `next-secure-headers`, `helmet` o configura manualmente estas cabeceras:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`

---

### 📦 Dependencias seguras

- Usa `npm audit` o `pnpm audit` regularmente.
- Mantén tus dependencias actualizadas.
- Evita paquetes sin mantenimiento o baja popularidad.

---

### 📤 Despliegue

- Si usas Vercel, asegúrate de:
  - Activar protección de variables de entorno.
  - No hacer exposiciones públicas de logs o errores.
  - Usar edge middleware para redireccionamientos y validaciones extra si aplica.

---

### 🚨 Logging y errores

- Nunca loguees tokens, passwords o datos personales.
- Usa herramientas como `Sentry` o `Logtail` para rastrear errores sin comprometer datos sensibles.
