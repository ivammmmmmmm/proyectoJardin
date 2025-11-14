-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-11-2025 a las 06:31:17
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proyecto_jardin`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno`
--

CREATE TABLE `alumno` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `apellido` varchar(25) NOT NULL,
  `dni` int(11) NOT NULL,
  `direccion` varchar(25) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `idLocalidad` int(11) DEFAULT NULL,
  `idSala` int(11) NOT NULL,
  `idEstado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`id`, `nombre`, `apellido`, `dni`, `direccion`, `fecha_nacimiento`, `idLocalidad`, `idSala`, `idEstado`) VALUES
(6, 'a', 's', 2, 'micasa', '0000-00-00', NULL, 1, NULL),
(7, 'a', 's', 2, 'micasa', '2025-08-12', NULL, 2, NULL),
(8, 'a', 's', 2, 'micasa', '2025-08-12', NULL, 3, NULL),
(9, 'alejo', 'cangrejo', 48863144, 'bolivia 223', '2058-03-22', NULL, 3, NULL),
(16, 'geronimo', 'corleta', 90, 'cerrito', '1987-02-22', NULL, 2, NULL),
(17, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20', NULL, 1, NULL),
(18, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20', NULL, 3, NULL),
(19, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20', NULL, 2, NULL),
(20, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20', NULL, 2, NULL),
(21, 'Jose', 'Golpe', 48926736, 'El callao 9288', '2006-08-17', NULL, 1, NULL),
(22, 'a', 's', 0, 'sasa', '1231-02-22', 663804012, 1, NULL),
(23, 'asd', 'asd', 213, 'sadas', '1111-11-11', 2147483647, 1, NULL),
(24, 'a', 'b', 2, '11', '0000-00-00', 34028010, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnotutor`
--

CREATE TABLE `alumnotutor` (
  `id` int(11) NOT NULL,
  `idPadreTutor` int(11) NOT NULL,
  `idAlumno` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumnotutor`
--

INSERT INTO `alumnotutor` (`id`, `idPadreTutor`, `idAlumno`) VALUES
(6, 10, 19),
(7, 11, 19),
(8, 12, 20),
(9, 13, 20),
(15, 15, 16),
(16, 14, 16),
(17, 10, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunicado`
--

CREATE TABLE `comunicado` (
  `id` int(11) NOT NULL,
  `idAlumno` int(11) NOT NULL,
  `idPadreTutor` int(11) NOT NULL,
  `idDocente` int(11) NOT NULL,
  `idSala` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `medioUtilizado` varchar(25) NOT NULL,
  `causa` varchar(25) NOT NULL,
  `desarrollo` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comunicado`
--

INSERT INTO `comunicado` (`id`, `idAlumno`, `idPadreTutor`, `idDocente`, `idSala`, `fecha`, `medioUtilizado`, `causa`, `desarrollo`) VALUES
(1, 24, 9, 4, 2, '1111-11-11', 'Email', 'A', 'B'),
(2, 24, 9, 4, 2, '1111-11-11', 'Email', 'A', 'B'),
(3, 21, 14, 4, 1, '1111-11-11', 'Presencial', 'asa', 'asa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docente`
--

CREATE TABLE `docente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `apellido` varchar(25) NOT NULL,
  `dni` int(11) NOT NULL,
  `direccion` varchar(25) NOT NULL,
  `telefono` int(11) NOT NULL,
  `mail` varchar(25) NOT NULL,
  `idEstado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `docente`
--

INSERT INTO `docente` (`id`, `nombre`, `apellido`, `dni`, `direccion`, `telefono`, `mail`, `idEstado`) VALUES
(2, 'a', 's', 2, 'cc2', 12, 'as', 1),
(3, '2', '2', 2, '22', 2, '2', 1),
(4, '3', '3', 3, '3', 3, '3', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`id`, `nombre`) VALUES
(1, 'Cursando'),
(2, 'Dado de baja'),
(3, 'promocionado'),
(4, 'egresado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `falta`
--

CREATE TABLE `falta` (
  `id` int(11) NOT NULL,
  `idAlumno` int(11) NOT NULL,
  `idSala` int(11) NOT NULL,
  `idRazon` int(11) NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `falta`
--

INSERT INTO `falta` (`id`, `idAlumno`, `idSala`, `idRazon`, `fecha`) VALUES
(3, 18, 2, 4, '2025-10-17'),
(4, 19, 2, 3, '2025-10-18'),
(5, 20, 3, 1, '2025-10-19'),
(6, 21, 3, 5, '2025-10-20'),
(7, 24, 2, 2, '2025-10-21'),
(8, 16, 2, 3, '2025-10-22'),
(9, 19, 2, 3, '2025-10-22'),
(10, 20, 2, 3, '2025-10-22'),
(11, 7, 2, 3, '2025-10-22'),
(12, 23, 1, 3, '2025-10-22'),
(13, 24, 1, 3, '2025-10-22'),
(14, 21, 1, 3, '2025-10-22'),
(15, 17, 1, 3, '2025-10-22'),
(16, 6, 1, 3, '2025-10-22'),
(17, 22, 1, 3, '2025-10-22'),
(18, 9, 3, 1, '2025-10-23'),
(19, 23, 1, 4, '2025-10-27'),
(20, 23, 1, 1, '2025-10-28'),
(21, 16, 1, 2, '2025-11-09'),
(22, 16, 1, 2, '2025-11-10'),
(23, 16, 1, 3, '2025-11-12'),
(52, 16, 1, 2, '2025-11-11'),
(53, 16, 1, 2, '2025-11-13'),
(54, 16, 2, 1, '2025-11-13'),
(55, 16, 2, 3, '2025-11-13'),
(56, 16, 2, 1, '2025-11-14'),
(57, 19, 2, 2, '2025-11-14'),
(58, 20, 2, 1, '2025-11-14'),
(59, 7, 2, 3, '2025-11-14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `localidad`
--

CREATE TABLE `localidad` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `padretutor`
--

CREATE TABLE `padretutor` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) DEFAULT NULL,
  `apellido` varchar(25) DEFAULT NULL,
  `telefono` int(11) DEFAULT NULL,
  `direccion` varchar(25) DEFAULT NULL,
  `idLocalidad` int(11) NOT NULL,
  `mail` varchar(25) DEFAULT NULL,
  `dni` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `padretutor`
--

INSERT INTO `padretutor` (`id`, `nombre`, `apellido`, `telefono`, `direccion`, `idLocalidad`, `mail`, `dni`) VALUES
(3, 'a', 's', 11, '', 0, NULL, NULL),
(4, 'a', 's', 11, NULL, 0, NULL, NULL),
(5, 'a', 's', 11, NULL, 0, NULL, NULL),
(6, 'a', 's', 11, NULL, 0, NULL, NULL),
(7, 'a', 's', 11, NULL, 0, NULL, NULL),
(9, 'marta', 'nasko', 2147483647, 'cositorto', 0, NULL, NULL),
(10, 'enrique', 'savio', 2147483647, 'serrioto', 0, NULL, NULL),
(11, 'marta', 'nasko', 2147483647, 'cositorto', 0, NULL, NULL),
(12, 'enrique', 'savio', 2147483647, 'serrioto', 0, NULL, NULL),
(13, 'marta', 'nasko', 2147483647, 'cositorto', 0, NULL, NULL),
(14, 'Marcelo', 'Rivera', 1198372377, 'serrioto', 0, NULL, NULL),
(15, 'Alejo', 'Pintos', 1134584953, 'manuel alberti 893', 0, NULL, NULL),
(16, 'prueba', 'nose', 122, '19', 42077010, 'masda12@gmail.com', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presente`
--

CREATE TABLE `presente` (
  `id` int(11) NOT NULL,
  `idAlumno` int(11) NOT NULL,
  `idSala` int(11) NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `presente`
--

INSERT INTO `presente` (`id`, `idAlumno`, `idSala`, `fecha`) VALUES
(252, 19, 2, '2025-11-11'),
(253, 20, 2, '2025-11-11'),
(254, 7, 2, '2025-11-11'),
(255, 16, 2, '2025-11-11'),
(257, 24, 1, '2025-11-11'),
(258, 21, 1, '2025-11-11'),
(259, 17, 1, '2025-11-11'),
(260, 6, 1, '2025-11-11'),
(261, 22, 1, '2025-11-11'),
(263, 19, 2, '2025-11-13'),
(264, 20, 2, '2025-11-13'),
(265, 7, 2, '2025-11-13'),
(268, 21, 1, '2025-11-13'),
(269, 17, 1, '2025-11-13'),
(270, 6, 1, '2025-11-13'),
(271, 22, 1, '2025-11-13'),
(273, 18, 3, '2025-11-13'),
(274, 8, 3, '2025-11-13'),
(275, 19, 2, '2025-11-14'),
(276, 20, 2, '2025-11-14'),
(277, 7, 2, '2025-11-14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `razon`
--

CREATE TABLE `razon` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `razon`
--

INSERT INTO `razon` (`id`, `nombre`) VALUES
(1, 'Enfermedad'),
(2, 'Inasistencia injustificad'),
(3, 'Problemas familiares'),
(4, 'Turno médico'),
(5, 'Condiciones climáticas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sala`
--

CREATE TABLE `sala` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `idTurno` int(11) NOT NULL,
  `idDocente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sala`
--

INSERT INTO `sala` (`id`, `nombre`, `idTurno`, `idDocente`) VALUES
(1, '1', 1, 2),
(2, '2', 2, 3),
(3, '3', 1, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

CREATE TABLE `turno` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `turno`
--

INSERT INTO `turno` (`id`, `nombre`) VALUES
(1, 'Mañana'),
(2, 'Tarde');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `alumnotutor`
--
ALTER TABLE `alumnotutor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `comunicado`
--
ALTER TABLE `comunicado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `docente`
--
ALTER TABLE `docente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `falta`
--
ALTER TABLE `falta`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `localidad`
--
ALTER TABLE `localidad`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `padretutor`
--
ALTER TABLE `padretutor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `presente`
--
ALTER TABLE `presente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `razon`
--
ALTER TABLE `razon`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sala`
--
ALTER TABLE `sala`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `turno`
--
ALTER TABLE `turno`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `alumnotutor`
--
ALTER TABLE `alumnotutor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `comunicado`
--
ALTER TABLE `comunicado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `docente`
--
ALTER TABLE `docente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `falta`
--
ALTER TABLE `falta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `localidad`
--
ALTER TABLE `localidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `padretutor`
--
ALTER TABLE `padretutor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `presente`
--
ALTER TABLE `presente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=278;

--
-- AUTO_INCREMENT de la tabla `razon`
--
ALTER TABLE `razon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sala`
--
ALTER TABLE `sala`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `turno`
--
ALTER TABLE `turno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
