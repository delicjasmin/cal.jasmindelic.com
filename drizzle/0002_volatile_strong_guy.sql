CREATE TABLE `events` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`title` varchar(256),
	`duration` varchar(256),
	`location` text,
	`link` varchar(256),
	`enabled` boolean,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
