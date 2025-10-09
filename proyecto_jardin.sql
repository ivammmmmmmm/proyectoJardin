-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-10-2025 a las 08:47:55
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
  `idEstado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`id`, `nombre`, `apellido`, `dni`, `direccion`, `fecha_nacimiento`, `idLocalidad`, `idEstado`) VALUES
(22, 'Lucía', 'Fernández', 42875639, 'Av. San Martín 1234', '2004-05-17', NULL, 1),
(23, 'Martín', 'Gómez', 41234987, 'Calle Mitre 876', '2003-09-02', NULL, 1),
(24, 'Valentina', 'Rodríguez', 43721598, 'Av. Rivadavia 5620', '2005-02-23', NULL, 1),
(25, 'Julián', 'Pérez', 39872145, 'Calle Belgrano 233', '2002-12-14', NULL, 1),
(26, 'Camila', 'López', 45321098, 'Av. Libertador 985', '2006-04-28', NULL, 1),
(27, 'Nicolás', 'Díaz', 41789234, 'Calle Moreno 1456', '2003-08-19', NULL, 1),
(28, 'Sofía', 'Martínez', 42657892, 'Pasaje Las Rosas 342', '2004-11-10', NULL, 1),
(29, 'Tomás', 'Suárez', 44521984, 'Calle Sarmiento 999', '2005-06-05', NULL, 1),
(30, 'Agustina', 'Romero', 43982165, 'Av. Corrientes 2101', '2004-02-11', NULL, 1),
(31, 'Mateo', 'Ruiz', 40127893, 'Calle Lavalle 532', '2002-10-09', NULL, 1),
(32, 'Micaela', 'Torres', 42987124, 'Av. Belgrano 1210', '2004-07-18', NULL, 1),
(33, 'Franco', 'Molina', 44876215, 'Calle Tucumán 874', '2005-01-25', NULL, 1),
(34, 'Julieta', 'Sosa', 43751983, 'Calle Independencia 221', '2003-05-30', NULL, 1),
(35, 'Lucas', 'Ramírez', 42236109, 'Av. Entre Ríos 1705', '2003-09-12', NULL, 1),
(36, 'Catalina', 'Vega', 45687923, 'Calle Pueyrredón 1500', '2006-03-07', NULL, 1),
(37, 'Lautaro', 'Acosta', 41598276, 'Calle Alberdi 932', '2003-01-03', NULL, 1),
(38, 'Milagros', 'Benítez', 44789122, 'Calle San Juan 324', '2005-10-21', NULL, 1),
(39, 'Ezequiel', 'Moreno', 42891357, 'Calle España 874', '2004-06-16', NULL, 1),
(40, 'Brenda', 'Castro', 44018765, 'Av. Luro 1902', '2004-09-29', NULL, 1),
(41, 'Facundo', 'Silva', 41984257, 'Calle Jujuy 456', '2003-02-08', NULL, 1);

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

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`id`, `nombre`) VALUES
(1, 'activo'),
(2, 'retirado');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
