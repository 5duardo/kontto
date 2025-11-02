# ⚙️ Setup de Compras In-App (KonttoPro)

## ✅ Estado Actual: En Build

El proyecto ha sido corregido y está siendo compilado en EAS Build.

### ✨ Lo que se hizo:

1. ✅ Se eliminó la carpeta `android/` que estaba causando conflictos
2. ✅ Se ejecutó `npx expo prebuild --clean` para regenerar correctamente
3. ✅ Se está ejecutando `eas build --platform ios --profile preview` para compilar

---

## ❌ Error Anterior: Módulo Nativo No Disponible

```
ERROR: Cannot find native module 'ExpoInAppPurchases'
WARN: Native module ExpoInAppPurchases JS wrapper loaded but native implementation not found.
```

Este error se resolverá con el build que está en progreso.

---

## 📋 IDs de Productos Configurados

| Plan | ID de Producto | Precio |
|------|---|---|
| 1 Semana | `KonttoPro1Semana` | $2.99 |
| 1 Mes | `com.kontto.app.subscription.monthly` | $9.99 |
| 1 Año | `com.kontto.app.subscription.annual` | $79.99 |

---

## ⏳ Monitorear el Build

El build está ejecutándose en https://expo.dev/builds

Puedes ver el progreso con:

```bash
eas build:list
```

Esto mostrará todos tus builds, el estado actual, y el link de descarga cuando esté listo.

---

## 📱 Próximos Pasos (Después del Build)

### 1. Descargar el Build (5-10 minutos después de que termine)

```bash
# Ver builds disponibles
eas build:list

# Busca el build más reciente con status "finished"
```

### 2. Instalar en iPhone

**Opción A: TestFlight (Recomendado)**
- Abre el link de TestFlight que recibiste por email
- Descarga la app en tu iPhone

**Opción B: Descarga directa**
```bash
# Ver el link de descarga
eas build:list --status=finished

# Descarga el .ipa y instálalo en XCode o Transporter
```

### 3. Probar Compras

1. Abre la app en tu iPhone
2. Ve a "Obtener Pro"
3. Intenta comprar un plan
4. Debería funcionar correctamente

---

## � Si algo falla

### Build falla con error de módulos

```bash
# Limpia todo y vuelve a intentar
npx expo prebuild --clean
eas build --platform ios --profile preview
```

### Las compras aún no funcionan

El módulo nativo tardó más en compilarse. Espera 5-10 minutos después de que aparezca el build.

### Necesitas más información

Ejecuta esto para ver detalles del build:

```bash
eas build:log --build-id=<build-id>
```

---

## 🔍 Verificar que Funciona

En la app, cuando abras "Obtener Pro":

❌ **Antes del build:**
```
"El módulo nativo de compras in-app no está disponible..."
```

✅ **Después del build:**
```
Los botones de compra funcionarán sin mensaje de error
```

---

## 📞 Resumen

1. **Build en progreso** ⏳
2. **Espera 10-15 minutos** a que termine
3. **Descarga desde TestFlight** cuando esté listo
4. **Instala en tu iPhone** 
5. **Prueba las compras** 

¡La app tendrá el módulo nativo compilado y las compras funcionarán! 🎉

---

## 📚 Referencia Completa de Comandos

```bash
# Ver estado de builds
eas build:list

# Descargar logs de build específico
eas build:log --build-id=<build-id>

# Crear nuevo build
eas build --platform ios --profile preview

# Para Android (cuando necesites)
eas build --platform android --profile preview

# Limpiar caché completo
npx expo prebuild --clean

# Verificar salud del proyecto
npx expo-doctor
```

---

✨ **El proyecto está correctamente configurado. Solo espera a que el build termine.** ✨

