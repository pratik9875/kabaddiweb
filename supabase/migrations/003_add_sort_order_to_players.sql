-- Add sort_order for drag-and-drop reordering
alter table players add column if not exists sort_order integer default 0;

-- Initialize sort_order based on jersey_number for existing players
update players set sort_order = row_number() over (order by jersey_number nulls last, created_at)
where sort_order = 0;
