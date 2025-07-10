-- Restore deleted post from Klevr topic
INSERT INTO public.posts (
  id,
  content,
  author_id,
  topic_id,
  created_at,
  updated_at,
  moderation_status,
  vote_score,
  is_anonymous
) VALUES (
  '2cef9797-3468-4968-a5f8-ab9fc8f2c3c1',
  'Will this be live streamed again? Will there be a recording made available? I really want to see this session but can''t make it.',
  'f9b82b05-4ad9-4b21-8096-c99e16de37ec',
  'df2da2c0-b9de-40a7-8d3e-51b98b8fddcf',
  '2025-01-10T00:44:03.991Z'::timestamp with time zone,
  '2025-01-10T00:44:03.991Z'::timestamp with time zone,
  'approved',
  0,
  false
);

-- Update the topic reply count to reflect the restored post
UPDATE public.topics 
SET reply_count = (
  SELECT COUNT(*) 
  FROM posts 
  WHERE posts.topic_id = 'df2da2c0-b9de-40a7-8d3e-51b98b8fddcf'
  AND posts.moderation_status = 'approved'
)
WHERE id = 'df2da2c0-b9de-40a7-8d3e-51b98b8fddcf';