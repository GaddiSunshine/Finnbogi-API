CREATE TABLE IF NOT EXISTS userInfos (
  id serial primary key,
  firstName character varying(128),
  surName character varying(128),
  address character varying(128),
  email character varying(128),
  phoneNumber character varying(128),
  ssn character varying(128) not null unique,
  startDate timestamp with time zone not null default current_timestamp
);

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  userInfoId integer not null,
  userName character varying(128) NOT NULL UNIQUE,
  role character varying(128) NOT NULL,
  admin boolean NOT NULL default false,
  password character varying(255) NOT NULL,
  FOREIGN KEY (userInfoId) references userInfos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shifts (
  id serial primary key,
  role character varying(128) not null,
  startTime timestamp with time zone not null default current_timestamp,
  endTime timestamp with time zone not null default current_timestamp,
  userId integer,
  FOREIGN KEY (userId) references users(id) ON DELETE CASCADE
);
