-- Add weight column to players table
alter table players add column if not exists weight numeric(5,1);
