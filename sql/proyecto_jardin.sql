-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-11-2025 a las 08:23:20
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
(9, 'alejo', 'cangrejo', 48863144, 'bolivia 223', '2058-03-22', NULL, 3, NULL),
(16, 'geronimo', 'corleta', 90, 'cerrito', '1987-02-22', NULL, 2, NULL),
(17, 'juan', 'ponce', 48853140, 'cerrito2', '2000-03-20', NULL, 1, NULL),
(21, 'Jose', 'Golpe', 48926736, 'El callao 9288', '2006-08-17', NULL, 1, NULL),
(25, 'tiziana', 'delacruz', 43321, '5345345', '2025-11-12', 46084020, 0, NULL),
(26, 'mamade', 'biscardi', 43321, '1109', '2020-01-27', 42077020, 0, 2),
(27, 'tizianashe', 'flores', 43321, '5345345', '2025-11-06', 6063050, 0, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
