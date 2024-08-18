CREATE TABLE `appointments` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`title` varchar(256),
	`starts_at` timestamp,
	`ends_at` timestamp,
	`location` text,
	`description` varchar(256),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `confirmation_codes` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`code` varchar(256),
	`expires_at` timestamp,
	`used_at` timestamp,
	CONSTRAINT `confirmation_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`email` varchar(256),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_availability` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`enabled` boolean,
	`start_time_minute_offset` int,
	`end_time_minute_offset` int,
	`day` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday'),
	CONSTRAINT `event_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256) NOT NULL,
	`title` varchar(256) NOT NULL DEFAULT 'Untitled',
	`duration` varchar(256) NOT NULL DEFAULT '60',
	`location` text NOT NULL DEFAULT ('No location given'),
	`link` varchar(256) NOT NULL DEFAULT 'ILiN7ESf3y',
	`enabled` boolean NOT NULL DEFAULT true,
	`timezone` varchar(256) NOT NULL DEFAULT 'cst',
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` varchar(256) NOT NULL,
	`appointment_id` varchar(256),
	`email` varchar(256),
	CONSTRAINT `participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(256) NOT NULL,
	`email` varchar(256),
	`password` varchar(256) NOT NULL,
	`name` varchar(256),
	`email_verified_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
