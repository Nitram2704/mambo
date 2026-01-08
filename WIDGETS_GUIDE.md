# Guía de Implementación: Wearables y Widgets

Esta guía detalla los pasos necesarios para implementar la parte nativa de los Wearables (WatchOS/WearOS) y los Widgets de pantalla de inicio, ya que estos requieren código nativo específico fuera del alcance de la configuración estándar de Expo.

## 1. Apple Watch (WatchOS)

### Requisitos
- Xcode instalado.
- Cuenta de desarrollador de Apple.

### Pasos
1. **Crear el Target**: En Xcode, ve a `File > New > Target...` y selecciona `Watch App`.
2. **Configurar App Groups**: Asegúrate de que tanto la app principal como la Watch App pertenezcan al mismo `App Group` (ej. `group.com.mambo.app`) para compartir datos.
3. **Comunicación**: Utiliza `WatchConnectivity` para enviar datos entre el iPhone y el Apple Watch (ej. estado del entrenamiento activo).
4. **UI**: Diseña la interfaz usando `SwiftUI` para una experiencia fluida.

## 2. Wear OS (Android)

### Requisitos
- Android Studio instalado.

### Pasos
1. **Crear el Módulo**: En Android Studio, ve a `File > New > New Module...` y selecciona `Wear OS Module`.
2. **Data Layer**: Utiliza la `Wearable Data Layer API` para sincronizar datos entre el teléfono y el reloj.
3. **Complications**: Implementa "Complications" para mostrar datos rápidos (ej. calorías del día) en la esfera del reloj.

## 3. Home Screen Widgets

### iOS (WidgetKit)
1. **Crear el Target**: `File > New > Target...` > `Widget Extension`.
2. **SwiftUI**: Los widgets en iOS se construyen exclusivamente con SwiftUI.
3. **TimelineProvider**: Define cómo se actualiza el widget (ej. cada hora o después de un entrenamiento).

### Android (App Widgets)
1. **Provider**: Crea una clase que herede de `AppWidgetProvider`.
2. **Layout**: Define la UI en un archivo XML de layout.
3. **RemoteViews**: Utiliza `RemoteViews` para actualizar el contenido del widget desde el servicio de la app.

---

> [!IMPORTANT]
> Para compartir datos entre la app de React Native y los componentes nativos, se recomienda usar `App Groups` (iOS) y `SharedPreferences` compartidos (Android), o persistir los datos en una base de datos local compartida como SQLite.
