-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2026 at 08:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ruangtemu`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL DEFAULT 'Palopo',
  `package_id` char(36) DEFAULT NULL,
  `package_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `total_price` decimal(12,0) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `customer_name`, `customer_email`, `customer_phone`, `event_type`, `event_name`, `event_date`, `event_time`, `location`, `city`, `package_id`, `package_name`, `status`, `notes`, `total_price`, `created_at`) VALUES
('bkg-00000000-0001', 'Andi Pratama', 'andi.pratama@example.com', '081234567890', 'wedding', 'Resepsi Pernikahan Andi & Sarah', '2026-10-15', '18:30:00', 'Banua Subur Convention Hall, Palopo', 'Palopo', '44444444-4444-4444-4444-444444444444', 'Paket Platinum All-in Hybrid', 'confirmed', 'Mohon backdrop nuansa Navy & Gold', 3800000, '2026-10-02 14:46:55'),
('bkg-00000000-0002', 'Rahmat Hidayat', 'rahmat.palopo@example.com', '082188776655', 'corporate', 'Gala Dinner BUMN Palopo', '2026-11-05', '19:00:00', 'Hotel Value Grand Ballroom Palopo', 'Palopo', '22222222-2222-2222-2222-222222222222', 'Paket Standard Deluxe', 'pending', 'Perlu invoice resmi perusahaan', 2500000, '2026-10-02 14:46:55');

-- --------------------------------------------------------

--
-- Table structure for table `entries`
--

CREATE TABLE `entries` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `event_id` char(36) NOT NULL,
  `event_slug` varchar(150) DEFAULT NULL,
  `guest_name` varchar(255) NOT NULL,
  `photo_url` longtext NOT NULL,
  `voice_note_url` longtext DEFAULT NULL,
  `message` text DEFAULT NULL,
  `filter_used` varchar(50) DEFAULT 'normal',
  `likes_count` int(11) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 1,
  `moderation_status` enum('PENDING','APPROVED','REJECTED','HIDDEN') DEFAULT 'APPROVED',
  `is_published` tinyint(1) DEFAULT 1,
  `client_submission_id` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `entries`
--

INSERT INTO `entries` (`id`, `event_id`, `event_slug`, `guest_name`, `photo_url`, `voice_note_url`, `message`, `filter_used`, `likes_count`, `is_approved`, `moderation_status`, `is_published`, `client_submission_id`, `created_at`, `updated_at`) VALUES
('014d9e4e-f941-4234-b167-3dd53194c0a1', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'aaa', '/uploads/entries/iqranurul-wedding-photo-1791026313516-24d9e070.png', NULL, 'lorem ipsum dolor sit amet\n', 'sepia', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 19:18:33', '2026-10-03 19:18:33'),
('0e13d642-86d5-40d5-9990-ee74fed9f009', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'bombom', '/uploads/entries/iqranurul-wedding-photo-1791034562895-5acd6e79.png', NULL, 'loerm\n', 'warm-vintage', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 21:36:02', '2026-10-03 21:36:02'),
('289be70e-e68f-4caf-9372-e78ae5f7d539', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'sss', '/uploads/entries/iqranurul-wedding-photo-1791053075620-592f3d9e.png', NULL, 'aa', 'normal', 0, 1, 'APPROVED', 1, NULL, '2026-10-04 02:44:35', '2026-10-04 02:44:35'),
('2e1f616c-9c65-4174-80e8-67407d919a88', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'b', '/uploads/entries/iqranurul-wedding-photo-1791026043448-a6601a27.png', '/uploads/audio/iqranurul-wedding-audio-1791026043465-24dbe190.webm', 'lllll', 'sepia', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 19:14:03', '2026-10-03 19:14:03'),
('5cfcb14f-b6ff-48e4-8ece-b75950a4d8e6', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'bom', '/uploads/entries/iqranurul-wedding-photo-1791022597706-7b713b93.png', NULL, 'lorem ipsum dolor sit amet\n', 'normal', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 18:16:37', '2026-10-03 18:16:37'),
('5f851954-68a5-4c3c-8f37-dd1d7d1613da', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'pino', '/uploads/entries/iqranurul-wedding-photo-1791037982013-ff57d931.png', '/uploads/audio/iqranurul-wedding-audio-1791037982025-46b3e6ff.webm', 'kata kata hari ini', 'sepia', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 22:33:02', '2026-10-03 22:33:02'),
('9f7d5304-9904-4272-98c3-22b6e0e3c96c', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'Bombom', '/uploads/entries/iqranurul-wedding-photo-1791024710847-fa452b24.png', NULL, NULL, 'soft-glow', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 18:51:50', '2026-10-03 18:51:50'),
('bcb8487b-019a-442b-8426-54a52224f110', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'aa', '/uploads/entries/iqranurul-wedding-photo-1791035967729-6e6ef4ad.png', NULL, NULL, 'grayscale', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 21:59:27', '2026-10-03 21:59:27'),
('e2d557b9-02cd-484b-9a33-e05b9fa8b46b', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'bombom2', '/uploads/entries/iqranurul-wedding-photo-1791036374489-07cac5db.png', '/uploads/audio/iqranurul-wedding-audio-1791036374504-0f132045.webm', 'lorem ipsum dolor sit amet', 'sepia', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 22:06:14', '2026-10-03 22:06:14'),
('fc396288-540f-4c17-adcb-c4e2f1fd88b2', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'p', '/uploads/entries/iqranurul-wedding-photo-1791026140074-2f649bb7.png', NULL, 'lllllll\n', 'sepia', 0, 1, 'APPROVED', 1, NULL, '2026-10-03 19:15:40', '2026-10-03 19:15:40');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `slug` varchar(150) NOT NULL,
  `title` varchar(255) NOT NULL,
  `host_name` varchar(255) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `event_name` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL DEFAULT 'wedding',
  `date` date NOT NULL,
  `venue` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL DEFAULT 'Palopo',
  `description` text DEFAULT NULL,
  `cover_image` text DEFAULT NULL,
  `cover_image_url` text DEFAULT NULL,
  `status` enum('DRAFT','ACTIVE','COMPLETED','ARCHIVED') DEFAULT 'ACTIVE',
  `is_active` tinyint(1) DEFAULT 1,
  `allow_guestbook` tinyint(1) DEFAULT 1,
  `allow_voice_note` tinyint(1) DEFAULT 1,
  `allow_custom_frame` tinyint(1) DEFAULT 1,
  `gallery_visibility` enum('PUBLIC','PRIVATE') DEFAULT 'PUBLIC',
  `default_frame_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`default_frame_config`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `slug`, `title`, `host_name`, `client_name`, `event_name`, `event_type`, `date`, `venue`, `city`, `description`, `cover_image`, `cover_image_url`, `status`, `is_active`, `allow_guestbook`, `allow_voice_note`, `allow_custom_frame`, `gallery_visibility`, `default_frame_config`, `created_at`, `updated_at`) VALUES
('168eaa11-aecc-4658-a74b-f3714fa68228', 'wedding-bombom', 'Wedding Bombom & ZZ', 'Bombom & Z', 'Bombom & Z', 'Wedding Bombom & ZZ', 'wedding', '2027-01-02', 'Gedung BRC', 'Palopo', '', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', 1, 1, 1, 1, 'PUBLIC', '{\"type\":\"strip_3\",\"backgroundColor\":\"#18181b\",\"borderColor\":\"#e7e5e4\",\"textContent\":\"Bombom & Z\",\"subTextContent\":\"2027-01-02 • Gedung BRC, Palopo\",\"fontFamily\":\"sans\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":0,\"sticker\":\"✦\"}', '2026-10-02 14:49:04', '2026-10-02 14:49:04'),
('1d93af26-b3ce-4236-b49e-4f8a694e1ab2', 'wedding-fahmy', 'Wedding Fahmi & Pasangan', 'Fahmi & Pasangan', 'Fahmi & Pasangan', 'Wedding Fahmi & Pasangan', 'wedding', '2027-09-01', 'Gedung SCC', 'Palopo', '', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', 1, 1, 1, 1, 'PUBLIC', '{\"type\":\"strip_3\",\"backgroundColor\":\"#18181b\",\"borderColor\":\"#e7e5e4\",\"textContent\":\"Fahmi & Pasangan\",\"subTextContent\":\"2027-09-01 • Gedung SCC, Palopo\",\"fontFamily\":\"sans\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":0,\"sticker\":\"✦\"}', '2026-10-02 14:49:53', '2026-10-02 14:49:53'),
('30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'The Wedding of Nurul & Iqra', 'Nurul & Iqra', 'Nurul & Iqra', 'The Wedding of Nurul & Iqra', 'wedding', '2026-09-28', 'Palopo', 'Palopo', '', '/images/events/nurul-iqra-real.jpg', '/images/events/nurul-iqra-real.jpg', 'ACTIVE', 1, 1, 1, 1, 'PUBLIC', '{\"type\":\"custom\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"textContent\":\"Nurul & Iqra\",\"subTextContent\":\"2026-09-28 • Palopo, Palopo\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"customOverlayUrl\":\"/uploads/frames/nurul-iqra-frame.png\",\"photoSlots\":[{\"x\":23,\"y\":214,\"width\":296,\"height\":192},{\"x\":365,\"y\":214,\"width\":296,\"height\":192},{\"x\":23,\"y\":451,\"width\":296,\"height\":192},{\"x\":365,\"y\":451,\"width\":296,\"height\":192},{\"x\":23,\"y\":690,\"width\":296,\"height\":193},{\"x\":365,\"y\":690,\"width\":296,\"height\":193}],\"photoCount\":6,\"frameImageWidth\":682,\"frameImageHeight\":1024}', '2026-10-03 04:48:36', '2026-10-03 21:15:58'),
('a659a0c1-fcc5-4dfc-a7e7-56c6aa844c5d', 'wedding-afdal-sukma', 'Wedding Afdal & Sukma', 'Afdal & Sukma', 'Afdal & Sukma', 'Wedding Afdal & Sukma', 'wedding', '2027-01-02', 'Aula Polidewa LT 4', 'Palopo', '', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', 1, 1, 1, 1, 'PUBLIC', '{\"type\":\"strip_3\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"customOverlayUrl\":\"/frames/frame-strip-floral.png\",\"textContent\":\"Afdal & Sukma\",\"subTextContent\":\"2027-01-02 • Aula Polidewa LT 4, Palopo\"}', '2026-10-02 23:50:41', '2026-10-02 23:50:41'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'wedding-andi-sarah', 'The Wedding of Andi & Sarah', 'Andi Pratama & Sarah Wijaya', 'Andi Pratama & Sarah Wijaya', 'The Wedding of Andi & Sarah', 'wedding', '2026-10-15', 'Banua Subur Convention Hall', 'Palopo', 'Selamat datang di perayaan hari bahagia kami. Abadikan momen terbaik Anda dan tinggalkan ucapan berkesan di RUANGTEMU photobooth kami!', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', NULL, 'COMPLETED', 0, 1, 1, 1, 'PUBLIC', '{\"type\": \"strip_3\", \"backgroundColor\": \"#0f172a\", \"borderColor\": \"#38bdf8\", \"textContent\": \"Andi & Sarah\", \"subTextContent\": \"15 Oktober 2026 • Palopo\", \"fontFamily\": \"serif\", \"textColor\": \"#ffffff\", \"padding\": 16, \"borderRadius\": 12, \"sticker\": \"💍\"}', '2026-10-02 14:46:55', '2026-10-04 02:05:14'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'palopo-creative-fest-2026', 'Palopo Youth Creative Festival 2026', 'Komunitas Kreatif Palopo', 'Komunitas Kreatif Palopo', 'Palopo Youth Creative Festival 2026', 'gathering', '2026-11-20', 'Gedung Kesenian Palopo', 'Palopo', 'Rayakan karya dan kreativitas anak muda Tana Luwu bersama RUANGTEMU Digital!', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop', NULL, 'COMPLETED', 0, 1, 1, 1, 'PUBLIC', '{\"type\": \"grid_4\", \"backgroundColor\": \"#18181b\", \"borderColor\": \"#a855f7\", \"textContent\": \"Palopo Creative Fest\", \"subTextContent\": \"#MudaKreatifPalopo\", \"fontFamily\": \"sans-serif\", \"textColor\": \"#ffffff\", \"padding\": 16, \"borderRadius\": 12, \"sticker\": \"✨\"}', '2026-10-02 14:46:55', '2026-10-04 02:09:08');

-- --------------------------------------------------------

--
-- Table structure for table `event_frames`
--

CREATE TABLE `event_frames` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `event_id` char(36) NOT NULL,
  `frame_id` char(36) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_frames`
--

INSERT INTO `event_frames` (`id`, `event_id`, `frame_id`, `sort_order`, `created_at`) VALUES
('bc591cc8-4ea0-42bc-8078-c147fc3dfdae', 'a659a0c1-fcc5-4dfc-a7e7-56c6aa844c5d', 'frm-1790956240633-0', 1, '2026-10-02 23:50:41'),
('e8fd4d8e-59da-4b00-b925-81a4498b9ab2', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'frm-1791026266059-2', 3, '2026-10-03 19:17:46'),
('f3b6b381-458f-4a29-83cf-11444bbcfcea', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'frm-1790974115027-0', 1, '2026-10-03 19:17:46'),
('f7409745-03e2-44a8-ab9a-f0f0f9852e95', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'frm-1791022338480-1', 2, '2026-10-03 19:17:46');

-- --------------------------------------------------------

--
-- Table structure for table `frames`
--

CREATE TABLE `frames` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `template_type` varchar(50) NOT NULL DEFAULT 'custom',
  `preview_url` longtext DEFAULT NULL,
  `config_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`config_json`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `frames`
--

INSERT INTO `frames` (`id`, `name`, `slug`, `template_type`, `preview_url`, `config_json`, `is_active`, `created_at`, `updated_at`) VALUES
('10000000-0000-0000-0000-000000000001', 'Classic Photo Strip (3 Foto)', 'strip-3-classic', 'strip_3', NULL, '{\"backgroundColor\": \"#0f172a\", \"borderColor\": \"#38bdf8\", \"fontFamily\": \"serif\", \"textColor\": \"#ffffff\", \"padding\": 16, \"borderRadius\": 12, \"sticker\": \"💍\"}', 1, '2026-10-02 14:46:55', '2026-10-02 14:46:55'),
('10000000-0000-0000-0000-000000000002', 'Modern Grid Kolase (4 Foto)', 'grid-4-modern', 'grid_4', NULL, '{\"backgroundColor\": \"#18181b\", \"borderColor\": \"#a855f7\", \"fontFamily\": \"sans-serif\", \"textColor\": \"#ffffff\", \"padding\": 16, \"borderRadius\": 12, \"sticker\": \"✨\"}', 1, '2026-10-02 14:46:55', '2026-10-02 14:46:55'),
('10000000-0000-0000-0000-000000000003', 'Vintage Polaroid (1 Foto)', 'polaroid-vintage', 'polaroid', NULL, '{\"backgroundColor\": \"#fafaf9\", \"borderColor\": \"#e7e5e4\", \"fontFamily\": \"handwriting\", \"textColor\": \"#1c1917\", \"padding\": 20, \"borderRadius\": 4, \"sticker\": \"📸\"}', 1, '2026-10-02 14:46:55', '2026-10-02 14:46:55'),
('10000000-0000-0000-0000-000000000004', 'Deluxe Dual Portrait (2 Foto)', 'deluxe-portrait', 'deluxe', NULL, '{\"backgroundColor\": \"#020617\", \"borderColor\": \"#f59e0b\", \"fontFamily\": \"serif\", \"textColor\": \"#f8fafc\", \"padding\": 18, \"borderRadius\": 8, \"sticker\": \"✦\"}', 1, '2026-10-02 14:46:55', '2026-10-02 14:46:55'),
('frm-1790954724055-0', 'Classic Floral Strip', 'frame-1-1790954724055', 'strip_3', '/frames/frame-strip-floral.png', '{\"type\":\"strip_3\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"customOverlayUrl\":\"/frames/frame-strip-floral.png\",\"textContent\":\"Test Host\",\"subTextContent\":\"2026-11-01 • Test VenueTest Venue, Palopo\"}', 1, '2026-10-02 23:25:24', '2026-10-02 23:25:24'),
('frm-1790954724055-1', 'Midnight Navy Gold', 'frame-2-1790954724055', 'strip_3', '/frames/frame-strip-navy-gold.png', '{\"type\":\"strip_3\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"customOverlayUrl\":\"/frames/frame-strip-navy-gold.png\",\"textContent\":\"Test Host\",\"subTextContent\":\"2026-11-01 • Test VenueTest Venue, Palopo\"}', 1, '2026-10-02 23:25:24', '2026-10-02 23:25:24'),
('frm-1790956240633-0', 'Classic Floral Strip', 'frame-1-1790956240633', 'strip_3', '/frames/frame-strip-floral.png', '{\"type\":\"strip_3\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"customOverlayUrl\":\"/frames/frame-strip-floral.png\",\"textContent\":\"Afdal & Sukma\",\"subTextContent\":\"2027-01-02 • Aula Polidewa LT 4, Palopo\"}', 1, '2026-10-02 23:50:41', '2026-10-02 23:50:41'),
('frm-1790974115027-0', 'nuruliqra-6x', 'nuruliqra-6x', 'custom', '/uploads/frames/nurul-iqra-frame.png', '{\"type\":\"custom\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"textContent\":\"Nurul & Iqra\",\"subTextContent\":\"2026-09-28 • Palopo, Palopo\",\"customOverlayUrl\":\"/uploads/frames/nurul-iqra-frame.png\",\"photoSlots\":[{\"x\":23,\"y\":214,\"width\":296,\"height\":192},{\"x\":365,\"y\":214,\"width\":296,\"height\":192},{\"x\":23,\"y\":451,\"width\":296,\"height\":192},{\"x\":365,\"y\":451,\"width\":296,\"height\":192},{\"x\":23,\"y\":690,\"width\":296,\"height\":193},{\"x\":365,\"y\":690,\"width\":296,\"height\":193}],\"photoCount\":6,\"frameImageWidth\":682,\"frameImageHeight\":1024}', 1, '2026-10-03 04:48:36', '2026-10-03 19:17:46'),
('frm-1791022338480-1', 'nuruliqra-1x', 'nuruliqra-1x', 'custom', '/uploads/frames/frame-2132-png-1791022331777-f23f6cd2.png', '{\"type\":\"custom\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"textContent\":\"Nurul & Iqra\",\"subTextContent\":\"2026-09-28 • Palopo, Palopo\",\"customOverlayUrl\":\"/uploads/frames/frame-2132-png-1791022331777-f23f6cd2.png\",\"photoSlots\":[{\"x\":203,\"y\":1485,\"width\":3193,\"height\":3517}],\"photoCount\":1,\"frameImageWidth\":3600,\"frameImageHeight\":5400}', 1, '2026-10-03 18:12:18', '2026-10-03 19:17:46'),
('frm-1791026266059-2', 'nuruliqra-2x', 'nuruliqra-2x', 'custom', '/uploads/frames/frame-214-png-1791026259900-c2128a26.png', '{\"type\":\"custom\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#e7e5e4\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":8,\"textContent\":\"Nurul & Iqra\",\"subTextContent\":\"2026-09-28 • Palopo, Palopo\",\"customOverlayUrl\":\"/uploads/frames/frame-214-png-1791026259900-c2128a26.png\",\"photoSlots\":[{\"x\":203,\"y\":1485,\"width\":3193,\"height\":1681},{\"x\":203,\"y\":3287,\"width\":3193,\"height\":1681}],\"photoCount\":2,\"frameImageWidth\":3600,\"frameImageHeight\":5400}', 1, '2026-10-03 19:17:46', '2026-10-03 19:17:46'),
('test-frame-1', 'Frame 1: Floral White (PNG)', 'frame-1-1790929718137', 'strip_3', '/frames/frame-strip-floral.png', '{\"type\":\"strip_3\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#ffffff\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":12,\"customOverlayUrl\":\"/frames/frame-strip-floral.png\"}', 1, '2026-10-02 16:28:38', '2026-10-02 16:28:38'),
('test-frame-2', 'Frame 2: Midnight Gold (PNG)', 'frame-2-1790929718137', 'strip_3', '/frames/frame-strip-navy-gold.png', '{\"type\":\"strip_3\",\"backgroundColor\":\"#0f172a\",\"borderColor\":\"#ffffff\",\"fontFamily\":\"serif\",\"textColor\":\"#ffffff\",\"padding\":16,\"borderRadius\":12,\"customOverlayUrl\":\"/frames/frame-strip-navy-gold.png\"}', 1, '2026-10-02 16:28:38', '2026-10-02 16:28:38');

-- --------------------------------------------------------

--
-- Table structure for table `media_assets`
--

CREATE TABLE `media_assets` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `event_id` char(36) NOT NULL,
  `entry_id` char(36) DEFAULT NULL,
  `media_type` enum('photo','audio','frame_overlay') NOT NULL,
  `storage_path` varchar(500) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size_bytes` bigint(20) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `slug` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tagline` text DEFAULT NULL,
  `price` decimal(12,0) NOT NULL,
  `duration_hours` int(11) NOT NULL DEFAULT 3,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`features`)),
  `popular` tinyint(1) DEFAULT 0,
  `category` enum('physical','virtual','hybrid') NOT NULL,
  `prints_included` varchar(255) DEFAULT NULL,
  `backdrop` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `slug`, `name`, `tagline`, `price`, `duration_hours`, `features`, `popular`, `category`, `prints_included`, `backdrop`, `created_at`) VALUES
('11111111-1111-1111-1111-111111111111', 'paket-basic', 'Paket Basic Photobooth', 'Pilihan hemat untuk perayaan intim dan ulang tahun di Palopo', 1800000, 2, '[\"2 Jam Layanan Aktif\", \"Unlimited Print 4R / 2-Strip\", \"Custom Template Frame Sesuai Tema\", \"Standard Fun Props & Aksesoris\", \"Download Semua Foto via Cloud Storage\", \"1 Operator & 1 Asisten Standby\"]', 0, 'physical', 'Unlimited High Speed DNP Print', 'Standard Sequin / Fabric', '2026-10-02 14:46:55'),
('22222222-2222-2222-2222-222222222222', 'paket-standard-deluxe', 'Paket Standard Deluxe', 'Paket terfavorit untuk resepsi pernikahan & wisuda di Palopo', 2500000, 3, '[\"3 Jam Layanan Penuh\", \"Unlimited Strip / 4R Glossy Prints\", \"Custom Frame Eksklusif dengan Logo Event\", \"Premium Props & Kacamata Unik\", \"Live Digital Gallery & QR Download\", \"2 Kru Profesional RUANGTEMU\", \"Free 1 Album Foto Kenangan\"]', 1, 'physical', 'Unlimited Thermal Photo Print', 'Pilihan 5+ Premium Backdrop', '2026-10-02 14:46:55'),
('33333333-3333-3333-3333-333333333333', 'paket-virtual-photobooth', 'Paket Virtual & Web Photobooth', 'Photobooth digital interaktif langsung dari smartphone tamu', 2200000, 12, '[\"Akses Web Photobooth Tanpa Install Aplikasi\", \"Frame Custom Digital (Strip, Grid, Polaroid)\", \"Guestbook Digital + Rekam Voice Note Audio Ucapan\", \"Live Projection Mode untuk LED Videotron Venue\", \"QR Code Table Standee Siap Cetak\", \"Dashboard Moderasi & Analytics Event\"]', 0, 'virtual', 'Digital Ultra HD Download + Cloud Archive', 'Virtual Digital Frame', '2026-10-02 14:46:55'),
('44444444-4444-4444-4444-444444444444', 'paket-platinum-hybrid', 'Paket Platinum All-in Hybrid', 'Solusi photobooth terlengkap: cetak fisik + platform digital interaktif', 3800000, 4, '[\"4 Jam Fisik Photobooth + 24 Jam Virtual Web Photobooth\", \"Unlimited Cetak Fisik + Live Projection Screen di Panggung\", \"Custom Wooden/Acrylic Table Standees\", \"Rekaman Voice Notes & Foto Ucapan Tamu\", \"Exclusive Guestbook Album Hardcover\", \"VIP Customer Support & Tim Khusus RUANGTEMU\"]', 1, 'hybrid', 'Unlimited Cetak Fisik + Digital Cloud', 'Custom Printed or Luxury Backdrop', '2026-10-02 14:46:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bookings_status` (`status`),
  ADD KEY `fk_booking_package` (`package_id`);

--
-- Indexes for table `entries`
--
ALTER TABLE `entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entries_event` (`event_id`),
  ADD KEY `idx_entries_moderation` (`moderation_status`),
  ADD KEY `idx_entries_created` (`created_at`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_events_slug` (`slug`),
  ADD KEY `idx_events_date` (`date`),
  ADD KEY `idx_events_status` (`status`);

--
-- Indexes for table `event_frames`
--
ALTER TABLE `event_frames`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_event_frame` (`event_id`,`frame_id`),
  ADD KEY `idx_ef_event` (`event_id`),
  ADD KEY `idx_ef_frame` (`frame_id`);

--
-- Indexes for table `frames`
--
ALTER TABLE `frames`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_frames_slug` (`slug`);

--
-- Indexes for table `media_assets`
--
ALTER TABLE `media_assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_media_event` (`event_id`),
  ADD KEY `fk_media_entry` (`entry_id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_packages_slug` (`slug`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_booking_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `entries`
--
ALTER TABLE `entries`
  ADD CONSTRAINT `fk_entry_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_frames`
--
ALTER TABLE `event_frames`
  ADD CONSTRAINT `fk_ef_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ef_frame` FOREIGN KEY (`frame_id`) REFERENCES `frames` (`id`);

--
-- Constraints for table `media_assets`
--
ALTER TABLE `media_assets`
  ADD CONSTRAINT `fk_media_entry` FOREIGN KEY (`entry_id`) REFERENCES `entries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_media_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
