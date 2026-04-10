# Gobernanza del repositorio

Este documento describe la configuración recomendada en GitHub para la rama `main`.

## Branch protection rule (main)

Configurar en `Settings > Branches > Add branch protection rule` con:

- `Require a pull request before merging`: habilitado
- `Require approvals`: 1 aprobación mínima
- `Dismiss stale pull request approvals when new commits are pushed`: habilitado
- `Require review from Code Owners`: habilitado
- `Require status checks to pass before merging`: habilitado
- Status checks requeridos:
  - `Test`
  - `Quality`
  - `Security`
  - `Build`
- `Require branches to be up to date before merging`: habilitado
- `Require conversation resolution before merging`: habilitado
- `Restrict pushes that create files larger than 100 MB`: recomendado
- `Allow force pushes`: deshabilitado
- `Allow deletions`: deshabilitado

## Reglas de aprobación de PR

- Ningún auto-merge sin checks verdes.
- Al menos una revisión humana aprobada.
- Si cambia CI/CD o gobernanza, requerir revisión de `CODEOWNERS`.

## Responsables (CODEOWNERS)

La definición está en `.github/CODEOWNERS` y protege:

- Código de aplicación (`/app/src/**`, `/app/public/**`)
- Configuración de CI/CD (`/.github/**`)
- Infraestructura base (`/Dockerfile`)
- Documentación (`/README.md`, `/docs/**`)
