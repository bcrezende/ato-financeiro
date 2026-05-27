-- Normalize existing transaction dates to 12:00 UTC of their calendar day.
-- Transaction dates are calendar days; anchoring at noon UTC makes display and
-- aggregation timezone-stable across all code paths (UI, exports, summaries).
-- The stored UTC calendar day is preserved (date_trunc keeps the day, +12h sets noon).
UPDATE "transactions" SET "date" = date_trunc('day', "date") + interval '12 hours';
