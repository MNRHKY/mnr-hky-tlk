
-- Add indexes for topic pagination performance
CREATE INDEX IF NOT EXISTS idx_topics_category_pinned_reply ON topics(category_id, is_pinned DESC, last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_moderation_category ON topics(moderation_status, category_id);

-- Add function to get paginated topics count
CREATE OR REPLACE FUNCTION get_topics_count(p_category_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_category_id IS NULL THEN
    RETURN (
      SELECT COUNT(*)::integer
      FROM topics 
      WHERE moderation_status = 'approved'
    );
  ELSE
    RETURN (
      SELECT COUNT(*)::integer
      FROM topics 
      WHERE category_id = p_category_id 
      AND moderation_status = 'approved'
    );
  END IF;
END;
$$;
