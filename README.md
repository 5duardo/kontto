# Kontto (React Native + Expo)

Aplicación de finanzas personales construida con Expo, React Native y TypeScript.

## Scripts

- `npm run start` — inicia el servidor de desarrollo de Expo.
- `npm run android` — compila/abre en Android.
- `npm run ios` — compila/abre en iOS (en macOS).
- `npm run web` — corre en Web.
- `npm run lint` — revisa el código con ESLint.
- `npm run lint:fix` — corrige problemas de linting automáticamente.
- `npm run format` — formatea el código con Prettier.

## Estructura

- `src/` contiene componentes, pantallas, navegación, estado global (Zustand), servicios y tema.
- `android/` contiene el proyecto nativo Android al ejectuar `expo run:android`.

## Aliases de importación

Se configuraron aliases para imports limpios:

- `@/` -> `src/`
- `@components` -> `src/components`
- `@screens` -> `src/screens`
- `@navigation` -> `src/navigation`
- `@store` -> `src/store`
- `@theme` -> `src/theme`
- `@services` -> `src/services`
- `@hooks` -> `src/hooks`
- `@utils` -> `src/utils`
- `@types` -> `src/types`

## Notas

- Se añadió ESLint + Prettier + EditorConfig para mantener un estilo consistente.
- Se tipó `AppNavigator` y se removieron anotaciones `@ts-ignore` innecesarias.
- Si ves errores de imports con aliases en tu editor, asegúrate de reiniciar el TS server en VS Code.

## Construir como profesional (Android e iOS con EAS)

Esta app usa Expo SDK 54 y está lista para construir en la nube con EAS (Expo Application Services).

### Requisitos

- Node 18+ y npm
- Cuenta de Expo: https://expo.dev
- Tener la CLI de EAS instalada globalmente (opcional) o usar `npx`.

Instalación (opcional):

```powershell
npm i -g eas-cli
```

Inicia sesión:

```powershell
eas login
```

### Perfiles de build

En `eas.json` hay perfiles listos:

- `development` (Android APK debug, iOS simulador)
- `preview` (distribución interna para QA)
- `production` (para tienda; iOS autoincrementa build number)
- `production-aab` (Android AAB para Play Store)

### Android

- Interno (APK rápido para pruebas):

```powershell
eas build -p android --profile preview
```

- Producción Play Store (AAB):

```powershell
eas build -p android --profile production-aab
```

Durante el primer build, EAS te guiará para crear/subir el keystore. Las credenciales quedan seguras en Expo.

### iOS

- Simulador (sin credenciales, genera .app):

```powershell
eas build -p ios --profile development
```

- Distribución interna/TestFlight/App Store (requiere cuenta de Apple):

```powershell
eas build -p ios --profile production
```

EAS puede crear certificados y provisioning profiles automáticamente. Alternativamente, puedes subir los tuyos.

### Envío a tiendas (opcional)

Con el build terminado:

```powershell
eas submit -p android --latest
eas submit -p ios --latest
```

Configura tus credenciales de Google Play Console / App Store Connect cuando te lo pida.

## 🛒 Compras In-App (KonttoPro)

La app incluye un sistema de compras in-app con tres planes:

| Plan | ID de Producto | Precio |
|------|---|---|
| 1 Semana | `KonttoPro1Semana` | $2.99 |
| 1 Mes | `com.kontto.app.subscription.monthly` | $9.99 |
| 1 Año | `com.kontto.app.subscription.annual` | $79.99 |

### Requisitos para compras funcionales

El módulo nativo `ExpoInAppPurchases` necesita ser compilado. Sigue estos pasos:

```bash
# 1. Limpiar archivos previos
npx expo prebuild --clean

# 2. Construir con EAS (recomendado)
eas build --platform ios --profile preview
# o para Android:
eas build --platform android --profile preview

# 3. Instalar en dispositivo físico desde TestFlight (iOS) o Google Play (Android)
```

Ver `SETUP_COMPRAS.md` para detalles completos.

### Versionado

El versionado está gestionado por EAS (`appVersionSource: "remote"`). Actualiza la versión en la página del proyecto en Expo o usa:

```powershell
eas-cli versions:configure
```

### Permisos y cumplimiento

- Se removieron permisos Android obsoletos/restringidos (`READ/WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW`) del `AndroidManifest.xml` para cumplir con políticas de Play.
- Los íconos/splash actuales usan `.jpg`. Para mejores resultados en tiendas, considera migrar a `.png` con transparencias para `icon`, `adaptiveIcon.foregroundImage` y `splash.image` en `app.json`.

### Troubleshooting

- Ejecuta diagnósticos:

```powershell
npx expo-doctor
```

- Tipos y lint:

```powershell
npm run typecheck
npm run lint
```

- Si usas Windows, corre los comandos en PowerShell como se muestran.

## Estructura profesional y limpieza

- Se eliminaron artefactos generados localmente: `.expo/`, `dist/` y la carpeta vacía `scripts/`.
- Se eliminó `android/app/debug.keystore` del proyecto (no debe versionarse). Gradle usará el keystore de depuración por defecto.
- Se fortaleció `.gitignore` para ignorar: `*.keystore`, `.gradle/`, `.idea/`, `*.iml`, archivos de sistema de Windows y logs generales.
- La carpeta `android/` y `ios/` están ignoradas por Git; se generan con `expo run:android` / `expo run:ios` cuando sea necesario.

Sugerencias futuras:

- Añadir un workflow de CI (por ejemplo, GitHub Actions) que ejecute `npm run typecheck` y `npm run lint` en PRs.
- Crear un `README` para describir convenciones de estilos de UI y cómo agregar nuevas pantallas/componentes.

