# NovaFin - Aplicación de Finanzas Personales

Aplicación web para promover el fortalecimiento de las finanzas personales en jóvenes universitarios.

## Proyecto de Grado
**Autor:** Stiven Reyes Bucles  
**Universidad:** Corporación Universitaria Reformada  
**Programa:** Ingeniería Informática  
**Año:** 2024

## Descripción
NovaFin es una herramienta tecnológica que facilita la educación financiera mediante:
- Registro de gastos e ingresos
- Visualización de historial financiero
- Categorías personalizables
- Recursos educativos

## Tecnologías
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Base de Datos: MongoDB


# 💰 NovaFin

**Aplicación web para promover el fortalecimiento de las finanzas personales en jóvenes universitarios**

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)

## 📋 Descripción

NovaFin es una herramienta tecnológica diseñada para facilitar la educación financiera entre estudiantes universitarios de la Corporación Universitaria Reformada. La aplicación permite a los usuarios gestionar sus finanzas personales de manera efectiva a través de una interfaz intuitiva y moderna.

## ✨ Características

- ✅ Sistema de autenticación (Registro e Inicio de sesión)
- ✅ Dashboard con resumen financiero en tiempo real
- ✅ Registro de ingresos y gastos con categorías
- ✅ **Historial completo con filtros avanzados** ← NUEVO
- ✅ **Búsqueda por categoría o descripción** ← NUEVO
- ✅ **Ordenamiento flexible (fecha, monto)** ← NUEVO
- ✅ **Filtrado por rango de fechas** ← NUEVO
- ✅ Eliminación de transacciones
- ✅ Cálculo automático de balance
- ✅ Categorías predeterminadas
- ✅ Almacenamiento local de datos
- ✅ Interfaz responsiva y moderna
- 🔄 Gráficos y estadísticas (Próximamente)
- 🔄 Recursos educativos financieros (Próximamente)

## 🛠️ Tecnologías

### Frontend
- **React** 18.3 - Librería de JavaScript para interfaces de usuario
- **React Router** 6.x - Navegación entre páginas
- **Tailwind CSS** 3.4 - Framework CSS para diseño
- **Vite** 5.x - Build tool ultrarrápido

### Almacenamiento
- **LocalStorage** - Almacenamiento persistente en el navegador

### Futuras Implementaciones
- **Node.js + Express** - Backend
- **MongoDB** - Base de datos
- **JWT** - Autenticación segura

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v20 o superior)
- npm o yarn
- Git

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU-USUARIO/novafin.git
cd novafin
```

2. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
```

3. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:5173
```

## 📁 Estructura del Proyecto
```
NovaFin/
│
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── Modal.jsx
│   │   │   └── TransactionForm.jsx
│   │   ├── pages/           # Páginas de la aplicación
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── utils/           # Utilidades y helpers
│   │   │   └── storage.js
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Punto de entrada
│   │
│   ├── public/              # Archivos estáticos
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # Servidor (Próximamente)
├── README.md
└── .gitignore
```

## 🎯 Roadmap

### Fase 1: MVP ✅ (Actual)
- [x] Autenticación básica
- [x] Dashboard con balance
- [x] Registro de transacciones
- [x] Almacenamiento local

### Fase 2: Funcionalidades Core ✅ (Completado)
- [x] Historial completo de transacciones
- [x] Filtros y búsqueda
- [x] Eliminar transacciones
- [ ] Editar transacciones
- [ ] Categorías personalizables

### Fase 3: Visualización 📊 (Próximamente)
- [ ] Gráficos de gastos por categoría
- [ ] Estadísticas mensuales
- [ ] Comparativas de periodos
- [ ] Exportar reportes

### Fase 4: Backend y Base de Datos 💾 (Futuro)
- [ ] API REST con Node.js
- [ ] Base de datos MongoDB
- [ ] Autenticación con JWT
- [ ] Sincronización en la nube

### Fase 5: Características Avanzadas 🚀 (Futuro)
- [ ] Recursos educativos financieros
- [ ] Metas de ahorro
- [ ] Presupuestos mensuales
- [ ] Notificaciones y recordatorios

## 👨‍💻 Autor

**Stiven Reyes Bucles**
- Universidad: Corporación Universitaria Reformada
- Programa: Ingeniería Informática
- Proyecto de Grado - 2024

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Para preguntas o sugerencias sobre el proyecto, puedes contactarme a través de GitHub.

---

⭐ Si te gusta este proyecto, no olvides darle una estrella en GitHub