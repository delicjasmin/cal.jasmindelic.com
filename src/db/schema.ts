import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  email: varchar("email", { length: 256 }).unique(),
  password: varchar("password", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }),
  emailVerifiedAt: timestamp("email_verified_at", { mode: "date" }),
});

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  contacts: many(contacts),
  confirmationCodes: many(confirmationCodes),
}));

export const confirmationCodes = mysqlTable("confirmation_codes", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id", { length: 256 }),
  code: varchar("code", { length: 256 }),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  usedAt: timestamp("used_at", { mode: "date" }),
});

export const confirmationCodesRelations = relations(
  confirmationCodes,
  ({ one }) => ({
    user: one(users, {
      fields: [confirmationCodes.userId],
      references: [users.id],
    }),
  }),
);

export const contacts = mysqlTable("contacts", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id", { length: 256 }),
  email: varchar("email", { length: 256 }),
});

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
}));

export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id", { length: 256 }),
  title: varchar("title", { length: 256 }),
  startsAt: timestamp("starts_at", { mode: "date" }),
  endsAt: timestamp("ends_at", { mode: "date" }),
  location: text("location"),
  description: varchar("description", { length: 256 }),
});

export const appointmentsRelations = relations(
  appointments,
  ({ many, one }) => ({
    participants: many(participants),
    user: one(users, {
      fields: [appointments.userId],
      references: [users.id],
    }),
  }),
);

export const participants = mysqlTable("participants", {
  id: varchar("id", { length: 256 }).primaryKey(),
  appointmentId: varchar("appointment_id", { length: 256 }),
  email: varchar("email", { length: 256 }),
});

export const participantsRelations = relations(participants, ({ one }) => ({
  appointment: one(appointments, {
    fields: [participants.appointmentId],
    references: [appointments.id],
  }),
}));

export const events = mysqlTable(
  "events",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    duration: varchar("duration", { length: 256 }).notNull(),
    location: text("location").notNull(),
    link: varchar("link", { length: 256 }).notNull(),
    enabled: boolean("enabled").notNull(),
    timezone: varchar("timezone", { length: 256 }).notNull(),
  },
  (t) => ({
    unq: unique().on(t.userId, t.link),
  }),
);

export const eventsRelations = relations(events, ({ many, one }) => ({
  eventAvailability: many(eventAvailability),
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

export const eventAvailability = mysqlTable(
  "event_availability",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    eventId: varchar("event_id", { length: 256 }).notNull(),
    enabled: boolean("enabled").notNull(),
    startTimeMinuteOffset: int("start_time_minute_offset").notNull(),
    endTimeMinuteOffset: int("end_time_minute_offset").notNull(),
    day: mysqlEnum("day", [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]).notNull(),
    dayIndex: int("day_index").notNull(),
  },
  (table) => ({
    checkConstraint: check(
      "day_index_check",
      sql`${table.dayIndex} >= 0 and ${table.dayIndex} <= 6`,
    ),
  }),
);

export const eventAvailabilityRelations = relations(
  eventAvailability,
  ({ one }) => ({
    event: one(events, {
      fields: [eventAvailability.eventId],
      references: [events.id],
    }),
  }),
);
