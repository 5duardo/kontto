# 📱 Integración de Anuncios en Kontto

## 🎯 Descripción

Este archivo documenta cómo agregar y gestionar anuncios en la aplicación React Native Kontto.

## 🚀 Configuración Inicial

### 1. Obtener IDs de Google AdMob

1. Ve a [Google AdMob Console](https://admob.google.com)
2. Inicia sesión con tu cuenta de Google
3. Crea una aplicación si no existe
4. Copia tu **App ID**
5. Crea unidades de anuncio (banner, intersticial, recompensa)
6. Copia los **Ad Unit IDs**

### 2. Configurar IDs en el Proyecto

Actualiza `src/services/adService.ts` con tus IDs reales:

```typescript
export const AD_UNIT_IDS = {
  BANNER_HOME: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',
  INTERSTITIAL_ADD_TRANSACTION: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',
  REWARD_GET_PRO: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',
};
```

## 📍 Cómo Usar Anuncios

### Banner Ads (Anuncios Banner)

Muestra un anuncio pequeño en la parte inferior de la pantalla:

```tsx
import { BannerAdComponent } from '@components';

export function MyScreen() {
  return (
    <View>
      {/* Tu contenido */}
      <BannerAdComponent />
    </View>
  );
}
```

### Interstitial Ads (Anuncios Interstitorios)

Muestra un anuncio de pantalla completa entre acciones:

```tsx
import { useInterstitialAd } from '@hooks';

export function MyScreen() {
  const { showInterstitialAd } = useInterstitialAd();

  const handleAddTransaction = async () => {
    // Mostrar anuncio antes de hacer algo importante
    await showInterstitialAd();
    // Continuar con la acción
  };

  return (
    <Button onPress={handleAddTransaction}>
      Agregar Transacción
    </Button>
  );
}
```

### Reward Ads (Anuncios de Recompensa)

El usuario ve un anuncio y recibe una recompensa:

```tsx
import { useRewardAd } from '@hooks';

export function GetProScreen() {
  const { showRewardAd } = useRewardAd();

  const handleWatchAd = async () => {
    await showRewardAd(() => {
      // Aquí ocurre la recompensa
      console.log('¡Usuario completó el anuncio!');
      // Desbloquear una moneda, feature, etc.
    });
  };

  return (
    <Button onPress={handleWatchAd}>
      Ver Anuncio para Recompensa
    </Button>
  );
}
```

## 🧪 Pruebas

### Test Device IDs

Para desarrollar sin tener anuncios reales, usa estos IDs de prueba de Google:

```typescript
export const TEST_AD_UNIT_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARD: 'ca-app-pub-3940256099942544/5224354917',
};
```

### Mejores Prácticas

✅ **Permitir:**
- Usar test device IDs durante desarrollo
- Colocar anuncios al final de pantallas
- Mostrar anuncios entre acciones del usuario
- Respetar preferencias de usuario (opción de Premium)

❌ **NO hacer:**
- Mostrar múltiples anuncios simultáneamente
- Usar anuncios de producción durante desarrollo
- Obligar al usuario a ver anuncios constantemente
- Esconder funcionalidad importante detrás de anuncios

## 📚 Próximos Pasos

1. **Instalar librería de AdMob:** Cuando Expo lo soporte nativamente
2. **Conectar con store:** Google Play Store y Apple App Store
3. **Hacer pruebas en dispositivo real**
4. **Monitorear ingresos en AdMob Dashboard**

## 📖 Referencias

- [Google AdMob Docs](https://developers.google.com/admob/android/quick-start)
- [Expo Docs](https://docs.expo.dev)
- [React Native Ads](https://reactnative.dev)

## 💡 Tips

- Los anuncios interstitorios funcionan mejor después de acciones completadas
- Los anuncios de recompensa generan más ingresos pero usa con moderación
- Siempre da opción Premium para eliminar anuncios
- Monitorea el engagement de tus usuarios con los anuncios
