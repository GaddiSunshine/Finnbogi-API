CREATE TABLE IF NOT EXISTS userInfos (
  id serial primary key,
  firstname character varying(128),
  surname character varying(128),
  address character varying(128),
  email character varying(128),
  phonenumber character varying(128),
  ssn character varying(128) not null,
  startDate timestamp with time zone not null default current_timestamp
);

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  userInfoId integer not null,
  userName character varying(128) NOT NULL,
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

CREATE TABLE IF NOT EXISTS notifications (
  id serial primary key,
  title character varying(128),
  text character varying(512)
);

CREATE TABLE IF NOT EXISTS notificationUsers (
  id serial primary key,
  userId integer NOT NULL,
  notificationId integer NOT NULL,
  read boolean default false,
  FOREIGN KEY (userId) references users(id) ON DELETE CASCADE,
  FOREIGN KEY (notificationId) references notifications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shiftexchange (
  id serial primary key,
  employeeid integer not null,
  shiftforexchangeid integer not null,
  coworkershiftid integer,
  status character varying(128),
  FOREIGN KEY (employeeid) references users(id) ON DELETE CASCADE,
  FOREIGN KEY (shiftforexchangeid) references shift(id) ON DELETE CASCADE,
  FOREIGN KEY (coworkershiftid) references shift(id) ON DELETE CASCADE
)