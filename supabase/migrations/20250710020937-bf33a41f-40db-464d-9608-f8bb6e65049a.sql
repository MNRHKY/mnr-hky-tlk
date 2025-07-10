
-- Add indexes for post pagination performance
CREATE INDEX IF NOT EXISTS idx_posts_topic_created_at ON posts(topic_id, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_moderation_topic ON posts(moderation_status, topic_id);

-- Add function to get paginated posts count
CREATE OR REPLACE FUNCTION get_posts_count(p_topic_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM posts 
    WHERE topic_id = p_topic_id 
    AND moderation_status = 'approved'
  );
END;
$$;
