# Módulo de Notificaciones - SGTA

## Descripción
Este módulo gestiona el sistema de notificaciones del Sistema de Gestión de Tareas Académicas (SGTA). Permite crear, gestionar y mostrar notificaciones a los usuarios del sistema.

## Características

### Frontend
- **Panel de Notificaciones**: Interfaz completa para visualizar y gestionar notificaciones
- **Filtros**: Por estado (todas, leídas, no leídas) y tipo (info, warning, success, error)
- **Acciones**: Marcar como leída/no leída, eliminar, marcar todas como leídas
- **Diseño Responsive**: Compatible con dispositivos móviles y tablets
- **Indicadores Visuales**: Iconos por tipo y badge con conteo de no leídas

### Backend (Microservicio)
- **API RESTful**: Endpoints completos para CRUD de notificaciones
- **Firebase Integration**: Almacenamiento en Firestore
- **Tipos de Notificación**: info, warning, success, error
- **Estados**: leída, no_leida
- **Filtrado y Paginación**: Soporte para consultas eficientes

## Estructura de Archivos

### Frontend
```
src/modules/notificaciones/
├── notificacion-panel.tsx    # Componente principal
├── notificacion-panel.css    # Estilos
```

### Backend
```
backend/notificaciones/
├── src/
│   ├── controllers/
│   │   └── notificacionesController.js
│   ├── models/
│   │   └── notificacion.js
│   ├── routes/
│   │   └── notificacionesRoutes.js
│   ├── services/
│   │   └── notificacionesService.js
│   └── index.js
├── package.json
```

## API Endpoints

- `GET /api/notificaciones/usuario/:uid` - Obtener notificaciones de un usuario
- `POST /api/notificaciones` - Crear nueva notificación
- `PATCH /api/notificaciones/:id/leida` - Marcar como leída
- `PATCH /api/notificaciones/:id/no-leida` - Marcar como no leída
- `DELETE /api/notificaciones/:id` - Eliminar notificación
- `PATCH /api/notificaciones/usuario/:uid/marcar-todas-leidas` - Marcar todas como leídas
- `GET /api/notificaciones/usuario/:uid/conteo-no-leidas` - Contar no leídas

## Uso

### Ejecutar el microservicio
```bash
cd backend
npm run dev:notificaciones
```

### Crear una notificación (ejemplo)
```javascript
import { crearNotificacion } from '../../api';

await crearNotificacion({
  titulo: 'Nueva tarea asignada',
  mensaje: 'Se ha asignado una nueva tarea...',
  tipo: 'info',
  destinatarioUid: 'usuario123',
  accionUrl: '/tareas/1'
});
```

## Características Técnicas

- **Responsive Design**: Compatible con todos los dispositivos
- **TypeScript**: Tipado fuerte en el frontend
- **Error Handling**: Manejo robusto de errores
- **Fallback de Datos**: Funciona con datos de ejemplo si la API no está disponible
- **Optimización**: Paginación y filtrado eficiente
- **Accesibilidad**: Títulos descriptivos y navegación por teclado

## Integración con otros módulos

El sistema de notificaciones está diseñado para integrarse fácilmente con otros módulos:

- **Usuarios**: Notificaciones de aprobación de cuentas
- **Tareas**: Notificaciones de nuevas asignaciones, recordatorios, vencimientos
- **Reportes**: Notificaciones de reportes generados
- **Sistema**: Notificaciones automáticas del sistema

## Futuras mejoras

- Notificaciones en tiempo real con WebSockets
- Notificaciones push del navegador
- Plantillas de notificaciones personalizables
- Configuración de preferencias de notificación por usuario
- Integración con email/SMS
