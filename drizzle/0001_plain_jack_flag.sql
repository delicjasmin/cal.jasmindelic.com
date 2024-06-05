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
CREATE TABLE `contacts` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`email` varchar(256),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` varchar(256) NOT NULL,
	`appointment_id` varchar(256),
	`email` varchar(256),
	CONSTRAINT `participants_id` PRIMARY KEY(`id`)
);
