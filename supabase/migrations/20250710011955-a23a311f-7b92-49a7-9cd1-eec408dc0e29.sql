-- Temporarily update the spam detection configuration to be more permissive for testing
UPDATE public.spam_detection_config 
SET config_value = jsonb_build_object(
  'anonymous', jsonb_build_object(
    'posts_per_hour', 10,
    'posts_per_day', 20,
    'topics_per_day', 5,
    'min_interval_seconds', 10
  )
)
WHERE config_key = 'rate_limits';