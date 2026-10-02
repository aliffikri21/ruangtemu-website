-- ================================================================
-- RUANGTEMU VIRTUAL PHOTOBOOTH - MySQL Schema
-- Compatible with phpMyAdmin / XAMPP / MySQL 8.0+
-- ================================================================
-- Import ini ke phpMyAdmin:
--   1. Buka phpMyAdmin (http://localhost/phpmyadmin)
--   2. Buat database baru: ruangtemu
--   3. Pilih database ruangtemu
--   4. Tab "Import" → pilih file ini → Execute
-- ================================================================

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS `ruangtemu`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ruangtemu`;

-- ────────────────────────────────────────────────────────────
-- 1. PACKAGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `packages` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `tagline` TEXT,
    `price` DECIMAL(12,0) NOT NULL,
    `duration_hours` INT NOT NULL DEFAULT 3,
    `features` JSON NOT NULL,
    `popular` TINYINT(1) DEFAULT 0,
    `category` ENUM('physical', 'virtual', 'hybrid') NOT NULL,
    `prints_included` VARCHAR(255),
    `backdrop` VARCHAR(255),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_packages_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 2. EVENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `events` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `slug` VARCHAR(150) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `host_name` VARCHAR(255) NOT NULL,
    `client_name` VARCHAR(255),
    `event_name` VARCHAR(255),
    `event_type` VARCHAR(50) NOT NULL DEFAULT 'wedding',
    `date` DATE NOT NULL,
    `venue` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'Palopo',
    `description` TEXT,
    `cover_image` TEXT,
    `cover_image_url` TEXT,
    `status` ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED') DEFAULT 'ACTIVE',
    `is_active` TINYINT(1) DEFAULT 1,
    `allow_guestbook` TINYINT(1) DEFAULT 1,
    `allow_voice_note` TINYINT(1) DEFAULT 1,
    `allow_custom_frame` TINYINT(1) DEFAULT 1,
    `gallery_visibility` ENUM('PUBLIC', 'PRIVATE') DEFAULT 'PUBLIC',
    `default_frame_config` JSON NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_events_slug` (`slug`),
    INDEX `idx_events_date` (`date`),
    INDEX `idx_events_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 3. FRAMES (Reusable frame catalog)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `frames` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `template_type` ENUM('strip_3', 'grid_4', 'polaroid', 'deluxe') NOT NULL,
    `preview_url` TEXT,
    `config_json` JSON NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_frames_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 4. EVENT_FRAMES (Junction: 1-3 frames per event)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `event_frames` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `event_id` CHAR(36) NOT NULL,
    `frame_id` CHAR(36) NOT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_event_frame` (`event_id`, `frame_id`),
    INDEX `idx_ef_event` (`event_id`),
    INDEX `idx_ef_frame` (`frame_id`),
    CONSTRAINT `fk_ef_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ef_frame` FOREIGN KEY (`frame_id`) REFERENCES `frames`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 5. BOOKINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_email` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(50) NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `event_name` VARCHAR(255) NOT NULL,
    `event_date` DATE NOT NULL,
    `event_time` TIME,
    `location` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'Palopo',
    `package_id` CHAR(36),
    `package_name` VARCHAR(255),
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `notes` TEXT,
    `total_price` DECIMAL(12,0) NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_bookings_status` (`status`),
    CONSTRAINT `fk_booking_package` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 6. ENTRIES (Guest Photobooth Captures & Guestbook)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `entries` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `event_id` CHAR(36) NOT NULL,
    `event_slug` VARCHAR(150),
    `guest_name` VARCHAR(255) NOT NULL,
    `photo_url` LONGTEXT NOT NULL,
    `voice_note_url` LONGTEXT,
    `message` TEXT,
    `filter_used` VARCHAR(50) DEFAULT 'normal',
    `likes_count` INT DEFAULT 0,
    `is_approved` TINYINT(1) DEFAULT 1,
    `moderation_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN') DEFAULT 'APPROVED',
    `is_published` TINYINT(1) DEFAULT 1,
    `client_submission_id` VARCHAR(100),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_entries_event` (`event_id`),
    INDEX `idx_entries_moderation` (`moderation_status`),
    INDEX `idx_entries_created` (`created_at` DESC),
    CONSTRAINT `fk_entry_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 7. MEDIA_ASSETS (File storage metadata)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `media_assets` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `event_id` CHAR(36) NOT NULL,
    `entry_id` CHAR(36),
    `media_type` ENUM('photo', 'audio', 'frame_overlay') NOT NULL,
    `storage_path` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size_bytes` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_media_event` (`event_id`),
    CONSTRAINT `fk_media_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_media_entry` FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
