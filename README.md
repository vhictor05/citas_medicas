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

## Autores y Atribución del Trabajo

Este proyecto fue desarrollado por:

* **Víctor González**
* **José Jiménez**

### Aclaración sobre el historial de commits

Durante el desarrollo del proyecto, **Víctor González** realizó contribuciones utilizando las cuentas de GitHub **Dicthor05** y **Ederwisse**. Esto se debió a motivos personales relacionados con el uso de herramientas de apoyo al desarrollo, por lo que parte de sus aportes aparecen registrados bajo ambos usuarios.

Por otra parte, **José Jiménez** no figura como autor directo en algunos de los commits presentes en la rama principal (*main*). Esto ocurrió debido a problemas de coordinación durante el proceso de integración del proyecto. Sin embargo, José participó activamente en el desarrollo, especialmente en la **parte visual y de interfaz de usuario (UI/UX)**.

Las mejoras visuales desarrolladas por José Jiménez fueron posteriormente integradas y subidas al repositorio por Victor González, razón por la cual algunos commits aparecen asociados únicamente a las cuentas utilizadas por este último.

### Distribución General del Trabajo

**Víctor González**

* Integración general del proyecto.
* Desarrollo e integración con Supabase.
* Lógica de negocio.
* Gestión de consultas médicas.
* Manejo de base de datos.
* Corrección de errores y pruebas.
* Integración final de funcionalidades.

**José Jiménez**

* Diseño visual de la aplicación.
* Mejoras de interfaz de usuario.
* Experiencia de usuario (UX).
* Apoyo en pruebas y revisión del sistema.

Esta aclaración se incluye para reflejar de manera transparente la participación real de ambos integrantes, independientemente de cómo aparezca registrado el historial de commits del repositorio.


