# Sistema de Gestión de Citas Médicas (CESFAM)

Este es un sistema web para la gestión de pacientes y agendas médicas de un Centro de Salud Familiar. Está construido con React, Vite y Supabase.

## Requisitos Previos

Para ejecutar este proyecto en tu computadora, debes tener instalado:

1. **Node.js** (versión 18 o superior recomendada). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
2. **Git** (opcional, para clonar el repositorio).

## Instalación y Ejecución

Debido a buenas prácticas de desarrollo, **la carpeta `node_modules` no se incluye en los archivos del proyecto** por su gran tamaño. Para descargar automáticamente solo los módulos estrictamente necesarios para que la aplicación funcione, sigue estos pasos:

1. Abre una terminal (o consola de comandos) en la carpeta raíz de este proyecto.
2. Ejecuta el siguiente comando para instalar todas las dependencias necesarias definidas en el archivo `package.json`:

   ```bash
   npm install
   ```

3. Una vez que termine la instalación (puede tardar unos segundos), inicia el servidor de desarrollo local ejecutando:

   ```bash
   npm run dev
   ```

4. La terminal te mostrará una dirección local (por lo general `http://localhost:5173/`). Abre ese enlace en tu navegador web para ver la aplicación funcionando.

## Roles del Sistema

El sistema cuenta con distintos roles de usuario:
- **Funcionario de Ventanilla**: Encargado de agendar citas, derivar pacientes a urgencias y verificar el retiro de medicamentos.
- **Médico**: Visualiza su agenda con los pacientes de urgencia priorizados, atiende consultas, emite recetas/certificados y cierra atenciones.
- **Enfermero**: (Próximamente) Gestión de procedimientos de enfermería.
