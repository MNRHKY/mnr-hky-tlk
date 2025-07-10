-- Fix the posts parent_post_id foreign key constraint to prevent cascade deletions
-- Drop existing constraint if it exists
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_parent_post_id_fkey;

-- Add the constraint back with ON DELETE SET NULL to orphan replies instead of deleting them
ALTER TABLE public.posts 
ADD CONSTRAINT posts_parent_post_id_fkey 
FOREIGN KEY (parent_post_id) REFERENCES public.posts(id) ON DELETE SET NULL;

-- Create function to clean up content references when posts are deleted
CREATE OR REPLACE FUNCTION public.cleanup_post_references(deleted_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called when a post is deleted to clean up references
  -- For now, we'll handle this in the application layer, but this provides
  -- a foundation for future database-level cleanup if needed
  
  -- Log the cleanup action
  RAISE NOTICE 'Cleaning up references to deleted post: %', deleted_post_id;
END;
$$;