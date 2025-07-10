-- Restore deleted post from Klevr topic with correct topic ID
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
  '709c8c5b-7302-44c7-861e-006dbdf46308',
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
  WHERE posts.topic_id = '709c8c5b-7302-44c7-861e-006dbdf46308'
  AND posts.moderation_status = 'approved'
)
WHERE id = '709c8c5b-7302-44c7-861e-006dbdf46308';