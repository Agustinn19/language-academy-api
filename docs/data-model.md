# Modelo de datos — Language Academy API

## 1. Alcance del diseño

Este documento define el modelo conceptual que será implementado más adelante con Prisma y PostgreSQL. La intención es preparar una base sólida para la gestión de cursos, inscripciones, contenido y progreso de usuarios.

No se implementa aún Prisma ni migraciones. Este documento es un diseño técnico previo.

## 2. Entidades propuestas

### 2.1 User
Propósito:
- Representa a cualquier usuario del sistema.
- Sirve para distinguir alumnos y administradores.
- También permite soportar la posibilidad futura de profesores, aunque no necesariamente como entidad separada en esta fase inicial.

Campos principales:
- id
- email
- passwordHash
- firstName
- lastName
- role
- isActive
- createdAt
- updatedAt
- lastLoginAt

Primary Key:
- id

Foreign Keys:
- No aplica a nivel directo.

Restricciones UNIQUE:
- email

Relaciones:
- Uno a muchos con Enrollment
- Uno a muchos con Progress
- Uno a muchos con Course como profesor/owner si se decide modelar la relación de profesor con usuario

Índices sugeridos:
- email (único, por necesidad de login y búsqueda)
- role (solo si hay consultas frecuentes por tipo de usuario)

### 2.2 Role
Propósito:
- Enum/tabla auxiliar para tipos de acceso del sistema.
- Permite distinguir alumno y administrador.
- En una implementación con Prisma, podría ser un enum, no necesariamente una entidad separada.

Campos principales:
- id
- name
- description

Primary Key:
- id

Restricciones UNIQUE:
- name

Relaciones:
- Uno a muchos con User

Nota:
- Si se prefiere mantener simplicidad, esta entidad puede ser un enum de Prisma en lugar de tabla separada.
- Se informa como posible entidad auxiliar, pero no es estrictamente necesaria en el diseño mínimo.

### 2.3 Course
Propósito:
- Representa un curso disponible en la academia.
- Incluye información general, contenido y disponibilidad.

Campos principales:
- id
- title
- slug
- description
- price
- isPublished
- isActive
- startDate
- endDate
- createdAt
- updatedAt
- languageId
- levelId
- teacherId

Primary Key:
- id

Foreign Keys:
- languageId -> Language
- levelId -> Level
- teacherId -> User

Restricciones UNIQUE:
- slug

Relaciones:
- Muchos a uno con Language
- Muchos a uno con Level
- Muchos a uno con User (profesor o responsable)
- Uno a muchos con Module
- Uno a muchos con Enrollment
- Uno a muchos con Progress

Índices sugeridos:
- languageId + isPublished
- levelId + isPublished
- teacherId

### 2.4 Language
Propósito:
- Representa cada idioma disponible en la academia.
- Permite soportar Inglés, Portugués, Italiano, Ruso y Japonés, y cualquier otro agregado luego.

Campos principales:
- id
- name
- code
- createdAt

Primary Key:
- id

Restricciones UNIQUE:
- name
- code

Relaciones:
- Uno a muchos con Course

Índices sugeridos:
- code

### 2.5 Level
Propósito:
- Representa los niveles de dominio del idioma.
- Permite valores como A1, A2, B1, B2, C1, C2.

Campos principales:
- id
- name
- code
- description

Primary Key:
- id

Restricciones UNIQUE:
- code
- name

Relaciones:
- Uno a muchos con Course
- Uno a muchos con User (si se decide guardar el nivel del alumno en el usuario o en una tabla específica)

Índices sugeridos:
- code

### 2.6 Module
Propósito:
- Agrupa el contenido de un curso en módulos o unidades.

Campos principales:
- id
- courseId
- title
- description
- order
- createdAt

Primary Key:
- id

Foreign Keys:
- courseId -> Course

Restricciones UNIQUE:
- (courseId, order)
- opcionalmente: (courseId, title) si se quiere evitar duplicados de nombre dentro del mismo curso

Relaciones:
- Muchos a uno con Course
- Uno a muchos con Lesson

Índices sugeridos:
- courseId + order

### 2.7 Lesson
Propósito:
- Representa cada clase o contenido didáctico dentro de un módulo.

Campos principales:
- id
- moduleId
- title
- content
- order
- durationMinutes
- createdAt

Primary Key:
- id

Foreign Keys:
- moduleId -> Module

Restricciones UNIQUE:
- (moduleId, order)

Relaciones:
- Muchos a uno con Module
- Uno a muchos con Progress

Índices sugeridos:
- moduleId + order

### 2.8 Enrollment
Propósito:
- Representa la inscripción de un alumno en un curso.
- Es la entidad intermedia clave entre User y Course.

Campos principales:
- id
- userId
- courseId
- status
- enrolledAt
- completedAt
- createdAt
- updatedAt

Primary Key:
- id

Foreign Keys:
- userId -> User
- courseId -> Course

Restricciones UNIQUE:
- (userId, courseId)

Relaciones:
- Muchos a uno con User
- Muchos a uno con Course

Índices sugeridos:
- userId + status
- courseId + status

### 2.9 Progress
Propósito:
- Representa el estado del progreso del alumno en una lección o módulo del curso.
- Permite registrar completitud de contenido y evolución del aprendizaje.

Campos principales:
- id
- userId
- courseId
- moduleId
- lessonId
- status
- completedAt
- createdAt
- updatedAt

Primary Key:
- id

Foreign Keys:
- userId -> User
- courseId -> Course
- moduleId -> Module
- lessonId -> Lesson

Restricciones UNIQUE:
- (userId, lessonId)
- (userId, courseId, lessonId)

Relaciones:
- Muchos a uno con User
- Muchos a uno con Course
- Muchos a uno con Module
- Muchos a uno con Lesson

Índices sugeridos:
- userId + courseId
- userId + status
- lessonId + status

Nota:
- En una implementación futura, puede ser útil separar `Progress` en dos niveles: progreso por lección y progreso por curso. Sin embargo, para la primera versión del diseño la representación anterior es suficiente y simple.

## 3. Relaciones y cardinalidad

### User ↔ Course
- Relación: muchos a muchos a través de Enrollment
- Conclusión: `Enrollment` es la entidad intermedia necesaria

### User ↔ Enrollment
- Relación: uno a muchos
- Un usuario puede tener muchas inscripciones

### Course ↔ Enrollment
- Relación: uno a muchos
- Un curso puede tener muchas inscripciones

### Course ↔ Module
- Relación: uno a muchos
- Un curso tiene varios módulos

### Module ↔ Lesson
- Relación: uno a muchos
- Un módulo tiene varias lecciones

### User ↔ Progress
- Relación: uno a muchos
- Un usuario puede tener varios registros de progreso

### Lesson ↔ Progress
- Relación: uno a muchos
- Una lección puede tener varios registros de progreso de distintos usuarios

## 4. Claves y restricciones

### Primary Keys
- `User.id`
- `Course.id`
- `Language.id`
- `Level.id`
- `Module.id`
- `Lesson.id`
- `Enrollment.id`
- `Progress.id`

### Foreign Keys
- `Course.languageId -> Language.id`
- `Course.levelId -> Level.id`
- `Course.teacherId -> User.id`
- `Module.courseId -> Course.id`
- `Lesson.moduleId -> Module.id`
- `Enrollment.userId -> User.id`
- `Enrollment.courseId -> Course.id`
- `Progress.userId -> User.id`
- `Progress.courseId -> Course.id`
- `Progress.moduleId -> Module.id`
- `Progress.lessonId -> Lesson.id`

### UNIQUE
- `User.email`
- `Course.slug`
- `Language.name`
- `Language.code`
- `Level.name`
- `Level.code`
- `Enrollment.(userId, courseId)`
- `Progress.(userId, lessonId)`
- `Module.(courseId, order)`
- `Lesson.(moduleId, order)`

### Índices propuestos
- `User.email` (ya es único)
- `Course.languageId`
- `Course.levelId`
- `Course.teacherId`
- `Enrollment.userId`
- `Enrollment.courseId`
- `Progress.userId`
- `Progress.lessonId`
- `Module.courseId`
- `Lesson.moduleId`

No se agregan índices extra sin necesidad justificada por consultas frecuentes.

## 5. Normalización

El modelo evita redundancia al separar:
- idiomas en `Language`
- niveles en `Level`
- contenido del curso en `Module` y `Lesson`
- inscripciones en `Enrollment`
- progreso en `Progress`

Esto evita errores como guardar nombre del profesor, nivel o idioma repetido dentro de cada curso y hacer que la data quede inconsistente. La relación con `User` en `teacherId` y la relación con `Language` y `Level` mantiene la información centralizada y normalizada.

## 6. Diseño orientado a Prisma

Este diseño puede transformarse naturalmente a modelos Prisma, con enums para:
- `Role`
- `EnrollmentStatus`
- `ProgressStatus`

Se recomienda mantener la estructura conceptual siguiente:

- `User`
- `Language`
- `Level`
- `Course`
- `Module`
- `Lesson`
- `Enrollment`
- `Progress`

Es importante dejar claro que la entidad `Role` puede ser un enum en lugar de tabla separada si se quiere simplificar el primer diseño. Esto depende de la complejidad que se quiera dar al sistema en la fase siguiente.

## 7. Coherencia con la API

El modelo soporta los recursos principales de la API futura:

- `/users`
- `/courses`
- `/modules`
- `/lessons`
- `/enrollments`
- `/progress`

La estructura permite construir endpoints REST con una base de datos consistente, sin introducir capas innecesarias ni sobre-diseño.

## 8. Decisiones pendientes

Las siguientes decisiones deben confirmarse antes de migrar a Prisma:

1. ¿`Role` será enum o entidad separada?
2. ¿`teacherId` en `Course` será obligatorio o opcional?
3. ¿el progreso será por lección únicamente o también por curso?
4. ¿`Language` y `Level` se cargarán como catálogo fijo o gestionado por administración?
5. ¿se requiere un nivel de usuario adicional como profesor, aparte de alumno y administrador?

Estas decisiones no bloquean el diseño base, pero sí afectan la forma final de las relaciones y del modelo Prisma.

## 9. Resumen final

El modelo recomendado es relativamente simple pero suficientemente expresivo para una academia de idiomas online:

- `User` centraliza autenticación y perfiles
- `Course` representa cursos
- `Language` y `Level` clasifican contenido
- `Module` y `Lesson` estructuran el aprendizaje
- `Enrollment` controla la relación alumno-curso
- `Progress` controla el avance del alumno

La pieza clave es que `Enrollment` funciona como entidad intermedia entre usuario y curso, mientras que `Progress` da una capa de trazabilidad sobre el contenido del curso.
