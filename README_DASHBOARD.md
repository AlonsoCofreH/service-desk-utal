# Dashboard KPI - Service Desk UTalca

## Descripción

El Dashboard KPI es una herramienta de visualización de métricas clave para el Service Desk de la Universidad de Talca. Proporciona a los agentes y administradores una vista completa del rendimiento del servicio de soporte técnico.

## Características Principales

### 📊 KPI Cards
- **Total de Tickets**: Número total de tickets en el período seleccionado
- **Tickets Pendientes**: Tickets abiertos o en proceso
- **Tickets Resueltos**: Tickets cerrados exitosamente
- **Tiempo Promedio de Resolución**: Tiempo promedio para resolver tickets (en horas)
- **Cumplimiento SLA**: Porcentaje de tickets resueltos dentro del tiempo acordado
- **Tiempo Primera Respuesta**: Tiempo promedio de primera respuesta a tickets

### 📈 Gráficos Interactivos
1. **Distribución por Servicio**: Gráfico de dona que muestra la distribución de tickets por tipo de servicio
2. **Evolución de Tickets**: Gráfico de líneas que muestra la tendencia de tickets creados vs resueltos
3. **Tickets por Prioridad**: Gráfico de barras que muestra la distribución por prioridad
4. **Rendimiento por Agente**: Gráfico de barras que compara el rendimiento de los agentes

### 📋 Tabla de Problemas Principales
- Lista de los problemas más frecuentes
- Porcentaje de incidencia
- Tendencia de cada problema

### 👤 Métricas de Agente (Solo para Agentes)
- Tickets asignados al agente
- Tickets resueltos por el agente
- Tiempo promedio de resolución personal
- Cumplimiento SLA personal

## Filtros de Fecha

El dashboard permite filtrar los datos por diferentes períodos:
- **Hoy**: Solo tickets del día actual
- **Esta semana**: Tickets de la semana en curso
- **Este mes**: Tickets del mes actual (por defecto)
- **Este trimestre**: Tickets del trimestre actual
- **Este año**: Tickets del año actual
- **Personalizado**: Rango de fechas específico

## Acceso y Permisos

### Roles de Usuario
- **Agente**: Puede ver todas las métricas generales y sus métricas personales
- **Administrador**: Acceso completo a todas las métricas y datos

### Autenticación
- Utiliza el mismo sistema de autenticación que el service desk principal
- Los usuarios deben estar autorizados en la base de datos de Firebase

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Gráficos**: Chart.js para visualizaciones interactivas
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Iconos**: Font Awesome 6
- **Diseño**: Paleta de colores corporativa UTalca

## Instalación y Configuración

1. **Requisitos**: 
   - Navegador web moderno
   - Conexión a internet
   - Credenciales de Firebase configuradas

2. **Archivos necesarios**:
   - `dashboard.html`: Página principal del dashboard
   - `dashboard.css`: Estilos específicos del dashboard
   - `dashboard.js`: Lógica y funcionalidad del dashboard
   - `firebase-config.js`: Configuración de Firebase
   - `style.css`: Estilos base del sistema

3. **Configuración de Firebase**:
   - Asegúrate de que `firebase-config.js` tenga las credenciales correctas
   - Verifica que las reglas de Firestore permitan lectura de tickets

## Uso del Dashboard

### Navegación
1. Accede al dashboard desde el enlace en la navegación principal
2. Inicia sesión con tus credenciales de UTalca
3. Selecciona el período de tiempo deseado
4. Usa el botón "Actualizar" para refrescar los datos

### Interpretación de Métricas

#### KPI Verdes (Positivos)
- Aumento en tickets resueltos
- Mejora en cumplimiento SLA
- Reducción en tiempo de resolución

#### KPI Rojos (Negativos)
- Aumento en tickets pendientes
- Deterioro en cumplimiento SLA
- Aumento en tiempo de resolución

### Gráficos
- **Hover**: Pasa el mouse sobre los gráficos para ver detalles
- **Zoom**: Algunos gráficos permiten zoom para mejor visualización
- **Leyendas**: Usa las leyendas para mostrar/ocultar series de datos

## Métricas Calculadas

### Tiempo de Resolución
```
Tiempo = (Fecha Resolución - Fecha Creación) / 3600000 (horas)
```

### Cumplimiento SLA
```
Cumplimiento = (Tickets en SLA / Total Tickets) * 100
```

### Tendencias
Las tendencias se calculan comparando con el período anterior:
```
Tendencia = ((Actual - Anterior) / Anterior) * 100
```

## Personalización

### Colores de Servicios
Cada tipo de servicio tiene un color específico basado en la paleta corporativa:
- Computadora: Azul principal (#3498db)
- SAP: Rojo acento (#e74c3c)
- Biblioteca: Azul información (#3498db)
- Internet: Verde éxito (#27ae60)
- Office365: Naranja advertencia (#f39c12)
- Impresora: Azul hover (#2980b9)
- Access Point: Gris secundario (#2c3e50)
- Biométrico: Rojo peligro (#e74c3c)

### Responsive Design
El dashboard se adapta automáticamente a diferentes tamaños de pantalla:
- Desktop: Vista completa con todos los elementos
- Tablet: Reorganización de gráficos
- Mobile: Vista simplificada con scroll

## Mantenimiento

### Actualización de Datos
- Los datos se actualizan en tiempo real desde Firebase
- El botón "Actualizar" fuerza una recarga completa
- Los gráficos se regeneran automáticamente

### Limpieza de Caché
Si experimentas problemas:
1. Cierra sesión
2. Limpia el caché del navegador
3. Vuelve a iniciar sesión

## Soporte Técnico

Para problemas o mejoras:
1. Verifica la conexión a internet
2. Revisa la consola del navegador para errores
3. Contacta al administrador del sistema

## Futuras Mejoras

- [ ] Exportación de reportes en PDF
- [ ] Notificaciones en tiempo real
- [ ] Métricas de satisfacción del cliente
- [ ] Predicciones basadas en IA
- [ ] Integración con sistemas externos
- [ ] Dashboard móvil nativo

## Changelog

### v1.0.0 (Actual)
- Dashboard inicial con KPI básicos
- Gráficos interactivos
- Filtros de fecha
- Métricas de agente
- Diseño responsive 