CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  userName character varying(128) NOT NULL UNIQUE,
  role character varying(128) NOT NULL,
  admin boolean NOT NULL default false,
  password character varying(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS shifts (
  id serial primary key,
  startTime timestamp with time zone not null default current_timestamp,
  endTime timestamp with time zone not null default current_timestamp,
  userId integer,
  FOREIGN KEY (userId) references users(id) ON DELETE CASCADE
);
