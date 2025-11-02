# Fuentes Neo Sans

Esta carpeta contiene los archivos de fuentes `Neo Sans Std Regular`.

## Archivos disponibles:
- ✅ `NeoSansStd-Regular.otf` (peso regular)

## Estado:
La fuente Neo Sans ya está configurada y se carga automáticamente al iniciar la app. El loader ahora espera a que las fuentes estén cargadas antes de mostrar la interfaz principal, lo que hace que la experiencia sea más fluida.

## Configuración aplicada:
- `app.json`: Configurado para precargar la fuente
- `typography.ts`: Fuente Neo Sans aplicada a todos los pesos
- `useAppLoading.ts`: Carga la fuente al iniciar y controla el loader
- `LoadingScreen.tsx`: Duración reducida a 300ms para transición rápida

La app ahora usa Neo Sans en toda la interfaz automáticamente.

