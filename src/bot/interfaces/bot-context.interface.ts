import { Context } from 'telegraf';

export interface MyContext extends Context {
  session: {
    step?: ACTIONS;
    fullName?: string;
    passport?: string;
  };
}

export enum ACTIONS {
  ASK_NAME = "ASK_NAME",
  ASK_PASSPORT = "ASK_PASSPORT",
  ASK_WORKS = "ASK_WORKS",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  SORTING = "SORTING",
  LIST_VIEWERS = "LIST_VIEWERS",
  SEND_NOTIFICATION = "SEND_NOTIFICATION",
  SPECTATOR_RECORD = "SPECTATOR_RECORD",
  ATTENDEE_RECORD = "ATTENDEE_RECORD",
  LIST_ATTENDEES = "LIST_ATTENDEES",
  ASK_CONTACT = "ASK_CONTACT"
}

export enum ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum DECISIONS {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}