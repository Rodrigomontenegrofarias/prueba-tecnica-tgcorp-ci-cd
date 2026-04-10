# Prueba técnica TG Corp - GitHub + CI/CD

Repositorio de ejemplo para demostrar gobernanza base en GitHub y un pipeline de CI/CD con buenas prácticas iniciales, usando Netlify como destino de despliegue.

## 1. Qué configuré

### Gobernanza del repositorio

- `CODEOWNERS` para definir responsables por áreas.
- Template de Pull Request con checklist de calidad, seguridad y rollback.
- Templates de Issues para bug y feature request.
- Configuración de Issues (`blank_issues_enabled: false`) para forzar trazabilidad.
- Documento de gobernanza con configuración recomendada de branch protection:
  - [docs/github-governance.md](docs/github-governance.md)

### CI/CD (GitHub Actions)

Workflow principal: `.github/workflows/ci-cd.yml`

Incluye 5 etapas explícitas:

1. **Test**
   - `npm ci`
   - `npm run test:ci`
2. **Quality**
   - `npm run lint`
   - `npm run build`
   - SonarQube/SonarCloud scan + Quality Gate (obligatorio)
3. **Security**
   - `npm audit --audit-level=high`
   - `gitleaks` para detección de secretos
   - `trivy` para vulnerabilidades (`HIGH,CRITICAL`)
4. **Build**
   - Build del bundle frontend para despliegue
   - Publicación del artefacto estático para el job de deploy
   - Build de imagen Docker con tag por `commit SHA`
5. **Deploy**
   - Deploy productivo a Netlify
   - Se activa solo si `ENABLE_NETLIFY_DEPLOY=true`

## 2. Qué cubre el pipeline

- Validación funcional mínima por tests.
- Calidad estática vía lint + Sonar Quality Gate + build reproducible.
- Seguridad de dependencias, secretos y vulnerabilidades con herramientas OSS.
- Trazabilidad del artefacto estático y de la imagen Docker por commit (`github.sha`).
- Despliegue automatizado a Netlify desde `main` sin depender de infraestructura cloud adicional.

## 3. Decisiones técnicas y por qué

- **Separar jobs por etapa**: facilita lectura, auditoría y debugging.
- **`needs` entre etapas**: evita desplegar si calidad o seguridad no están OK.
- **`npm ci` y cache de lockfile**: builds más deterministas y rápidos.
- **Sonar obligatorio con Quality Gate**: no se permite avanzar a build si no pasa el estándar de calidad.
- **Stack mayormente open source**: Jest, ESLint, NPM Audit, Gitleaks y Trivy para cobertura base sin licencias cerradas adicionales.
- **Artefacto estático para deploy**: el mismo bundle generado en CI es el que llega a Netlify.
- **Docker se conserva en Build**: mantiene la evidencia de empaquetado pedida en la prueba, aunque el hosting final sea estático.
- **Netlify como destino de despliegue**: permite publicar la aplicación estática con un flujo simple, reproducible y fácil de validar.
- **Build host-agnostic**: el frontend genera assets con rutas relativas para funcionar en Netlify y en futuros dominios custom.

## 4. Secretos y variables requeridos en GitHub

Definir en `Settings > Secrets and variables > Actions`.

### Secrets

- `SONAR_TOKEN`
- `SONAR_PROJECT_KEY`
- `SONAR_ORGANIZATION`
- `SONAR_HOST_URL` (opcional; default `https://sonarcloud.io`)
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

### Variables

- `ENABLE_NETLIFY_DEPLOY=false` por defecto

## 5. Secuencia para habilitar deploy en Netlify

1. Crear un sitio en Netlify.
2. Obtener:
   - `NETLIFY_SITE_ID` desde `Site configuration > General`
   - `NETLIFY_AUTH_TOKEN` desde `User settings > Applications > Personal access tokens`
3. Cargar ambos secrets en GitHub.
4. Cambiar la variable `ENABLE_NETLIFY_DEPLOY=true`.
5. Hacer push a `main`.

El job `deploy` descargará el artefacto generado en `build` y lo publicará con `netlify deploy --prod`.

## 6. Ejecución local

### Requisitos

- Node.js 20+
- npm 10+
- Docker

### Comandos

```bash
cd app
npm ci
npm run test:ci
npm run lint
npm run build
```

Build Docker:

```bash
docker build --build-arg APP_VERSION=local -t prueba-tecnica-tgcorp-ci-cd:local .
```

## 7. Entrega solicitada

Este repositorio cubre:

- Configuración y gobernanza base (CODEOWNERS, templates, guía de protection rules).
- Pipeline CI/CD con etapas de test, calidad, seguridad, build y deploy automático.
- Documentación de decisiones técnicas y alcance.
