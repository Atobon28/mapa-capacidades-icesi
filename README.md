# Mapa de capacidades · Universidad Icesi

Primera versión funcional del recurso de Educación para la Paz. Explora tres dimensiones y nueve ejes; permite seleccionar aprendizajes, explicar conexiones con un curso y descargar la reflexión.

## Ejecutar

Sitio estático sin dependencias de compilación. Servir esta carpeta con cualquier servidor HTTP, por ejemplo `python -m http.server 8000`. No abrir index.html directamente por file://: el mapa carga data.json mediante fetch.

## Desplegar en Vercel

Importar este repositorio. Framework: Other. Sin comando de build. Directorio de salida: raíz (`.`). No requiere variables de entorno.

## Funciones

- Mapa por dimensiones, filtros y búsqueda sin distinción de acentos.
- Nueve fichas con los 42 aprendizajes del cuadro actualizado.
- Definiciones disponibles en el lateral y en cada ficha según su clasificación.
- Estado por aprendizaje: lo trabajo / quiero fortalecerlo.
- Curso, reflexiones y evidencias guardados en localStorage. Los datos permanecen en el navegador; no hay servidor de almacenamiento.
- Exportación de selección a texto UTF-8.
- Orientaciones, fuentes y crédito de subvención.
- Asistente de demostración claramente identificado: no llama a un modelo ni analiza el texto introducido.
- Navegación por teclado, diálogos nativos, estados de foco y adaptación móvil.

## Fuentes y decisiones

Contenido del PDF revisado y del Word “Capacidades, habilidades y disposiciones (2)”, con comentarios aprobados de Diferencia, Autonomía y Socioemocional. Marca: manual 2026, Azul Icesi #5454E9 y Plus Jakarta Sans. El encabezado incorpora la versión horizontal con descriptor del logotipo, extraída sin redibujar de la página 15 del manual proporcionado. Se presenta en azul sobre blanco y conserva sus proporciones.

No contiene documentos originales de investigación ni datos de participantes. Las descripciones adaptadas y preguntas proceden del texto revisado. La clasificación y las listas conservan el cuadro, con normalización de espacios y puntuación.

## Validación pendiente

Pruebas con profesores, revisión institucional del uso de marca y futura conexión del asistente a fuentes verificadas. Esta versión no evalúa ni certifica capacidades.

## Actualización por revisión del equipo

- Introducción «Sobre este mapa» y «Para comprender el mapa» con la redacción sugerida en los comentarios.
- Identificación de la Decanatura de Innovación Educativa y Fortalecimiento del PEI (nombre en el manual institucional).
- Ruta visible de cinco pasos, con consulta libre del mapa.
- Descripción del curso, disciplina, estudiantes, propósitos, actividad e intención de fortalecimiento.
- Enlace explícito entre las selecciones del mapa y Mi selección, con confirmación de guardado.
- Reflexión por aprendizaje con pregunta del eje, relación, evidencia y ajuste propuesto.
- Resumen editable y exportable en texto o impresión/PDF. Se señalan los campos pendientes sin convertirlos en una evaluación.
- Contexto del curso incluido en exportaciones; el estado anterior se conserva mediante la misma clave de almacenamiento.
- Explicación de la función futura de IA y aviso visible de que la demostración no analiza ni transmite respuestas.
