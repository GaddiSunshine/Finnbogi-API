CREATE TABLE IF NOT EXISTS shifts(
  id serial primary key,
  userName varchar(128) not null,
  startTime timestamp with time zone not null default current_timestamp,
  endTime timestamp with time zone not null default current_timestamp
);
