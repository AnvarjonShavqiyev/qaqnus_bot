import LocalSession from "telegraf-session-local";

export const sessionMiddleware = new LocalSession({
  database: 'sessions.json',
}).middleware();
