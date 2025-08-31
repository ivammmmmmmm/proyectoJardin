-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 31-08-2025 a las 22:57:08
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
  `fecha_nacimiento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`id`, `nombre`, `apellido`, `dni`, `direccion`, `fecha_nacimiento`) VALUES
(2, '', '', 1, 'mi casa', '0000-00-00'),
(3, 'a', 's', 2, 'micasa', '2025-08-12'),
(4, 'a', 's', 2, 'micasa', '2025-08-12'),
(5, 'a', 's', 2, 'micasa', '2025-08-12'),
(6, 'a', 's', 2, 'micasa', '2025-08-12'),
(7, 'a', 's', 2, 'micasa', '2025-08-12'),
(8, 'a', 's', 2, 'micasa', '2025-08-12'),
(9, 'alejo', 'cangrejo', 48863144, 'bolivia 223', '2058-03-22'),
(10, 'geronimo', 'corleta', 90, 'cerrito', '0000-00-00'),
(11, 'geronimo', 'corleta', 90, 'cerrito', '0000-00-00'),
(12, 'geronimo', 'corleta', 90, 'cerrito', '0000-00-00'),
(13, 'geronim', 'corleta', 90, 'cerrito', '2025-08-16'),
(14, 'geronimo', 'corleta', 90, 'cerrito', '0000-00-00'),
(15, 'geronimo', 'corleta', 90, 'cerrito', '0000-00-00'),
(16, 'geronimo', 'corleta', 90, 'cerrito', '0000-00-00'),
(17, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20'),
(18, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20'),
(19, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20'),
(20, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20'),
(21, 'Jose', 'Golpe', 48926736, 'El callao 9288', '2006-08-17');

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
(2, 6, 15),
(3, 7, 16),
(4, 8, 18),
(5, 9, 18),
(6, 10, 19),
(7, 11, 19),
(8, 12, 20),
(9, 13, 20),
(10, 14, 21),
(11, 15, 21);

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `mail` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `padretutor`
--

INSERT INTO `padretutor` (`id`, `nombre`, `apellido`, `telefono`, `direccion`, `idLocalidad`, `mail`) VALUES
(1, 'a', 's', 11, NULL, 0, NULL),
(2, 'a', 's', 11, NULL, 0, NULL),
(3, 'a', 's', 11, NULL, 0, NULL),
(4, 'a', 's', 11, NULL, 0, NULL),
(5, 'a', 's', 11, NULL, 0, NULL),
(6, 'a', 's', 11, NULL, 0, NULL),
(7, 'a', 's', 11, NULL, 0, NULL),
(8, 'enrique', 'savio', 2147483647, 'serrioto', 0, NULL),
(9, 'marta', 'nasko', 2147483647, 'cositorto', 0, NULL),
(10, 'enrique', 'savio', 2147483647, 'serrioto', 0, NULL),
(11, 'marta', 'nasko', 2147483647, 'cositorto', 0, NULL),
(12, 'enrique', 'savio', 2147483647, 'serrioto', 0, NULL),
(13, 'marta', 'nasko', 2147483647, 'cositorto', 0, NULL),
(14, 'Marcelo', 'Rivera', 1198372377, 'serrioto', 0, NULL),
(15, 'Alejo', 'Pintos', 1134584953, 'manuel alberti 893', 0, NULL);

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

CREATE TABLE `turno` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `alumnotutor`
--
ALTER TABLE `alumnotutor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `comunicado`
--
ALTER TABLE `comunicado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `docente`
--
ALTER TABLE `docente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `localidad`
--
ALTER TABLE `localidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `padretutor`
--
ALTER TABLE `padretutor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `sala`
--
ALTER TABLE `sala`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `turno`
--
ALTER TABLE `turno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
