CREATE TABLE `confirmation_codes` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`code` varchar(256),
	`expires_at` timestamp,
	`used_at` timestamp,
	CONSTRAINT `confirmation_codes_id` PRIMARY KEY(`id`)
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
