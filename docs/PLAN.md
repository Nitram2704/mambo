# PLAN: Mambo Social & AI Enhancements (Fase 1)

## 🎼 Visión de Orquestación
Este plan coordina a 4 agentes especializados para implementar el sistema **Proof of Workout Automático (POW)** e integrar al **AI Social Commentator**.

---

## 🛠️ Desglose Técnico por Agente

### 1. 🏗️ Backend Specialist (@backend-specialist)
- **Supabase:** Asegurar que la tabla `social_posts` soporte campos de metadatos de workout.
- **AI Integration:** Implementar función `generateSmartWorkoutCaption(workoutData)` usando Gemini 2.5 Flash para crear textos motivadores únicos.
- **AI Commentator:** Crear un "trigger" (o lógica en el store) que, 5-10 minutos después de un post manual/automático, genere un comentario automático del "Mambo AI Coach" analizando los logros.

### 2. 🎨 Frontend Specialist (@frontend-specialist)
- **User Settings:** Añadir toggle "Publicación Automática" en la configuración de perfil.
- **PostCard Enhancement:** Rediseñar la sección de workout en `PostCard.tsx` para que parezca una "Story" premium (gradientes dinámicos, iconos de PR relucientes).
- **Haptics:** Integrar feedback táctil al completar la publicación automática.

### 3. 🧪 Test Engineer (@test-engineer)
- **Integration Tests:** Verificar que al terminar un workout se cree la entrada en `social_posts`.
- **Validation:** Asegurar que los datos de volumen y duración sean correctos.

---

## 📅 Cronograma de Ejecución (Fase 2)
Una vez aprobado, los agentes trabajarán en **PARALELO** sobre sus archivos asignados para minimizar el tiempo de entrega.

---

## ⏸️ CHECKPOINT DE APROBACIÓN
- **Meta:** Pasar de publicación manual con modal a publicación inteligente y automática.
- **Impacto:** Un feed social activo al 100% sin fricción para el usuario.
