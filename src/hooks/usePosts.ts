
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  content: string;
  author_id: string | null;
  topic_id: string;
  parent_post_id: string | null;
  created_at: string;
  updated_at: string;
  vote_score: number | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
  parent_post?: Post;
}

interface UsePostsOptions {
  page?: number;
  limit?: number;
}

interface UsePostsResult {
  posts: Post[];
  totalCount: number;
}

export const usePosts = (topicId: string, options: UsePostsOptions = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['posts', topicId, page, limit],
    queryFn: async (): Promise<UsePostsResult> => {
      console.log('Fetching posts for topic:', topicId, 'page:', page);
      
      // Get total count using the database function
      const { data: countData, error: countError } = await supabase
        .rpc('get_posts_count', { p_topic_id: topicId });
      
      if (countError) {
        console.error('Error fetching posts count:', countError);
        throw countError;
      }

      const totalCount = countData || 0;

      // Get paginated posts for the topic
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('topic_id', topicId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      if (!posts || posts.length === 0) {
        return { posts: [], totalCount };
      }

      // Get unique author IDs (including from posts that might be parents)
      const authorIds = [...new Set(posts.map(p => p.author_id).filter(Boolean))];
      
      // Get unique parent post IDs that need to be fetched
      const parentPostIds = [...new Set(posts.map(p => p.parent_post_id).filter(Boolean))];
      
      // Fetch parent posts if any exist
      let parentPosts = [];
      if (parentPostIds.length > 0) {
        const { data: parentPostsData, error: parentError } = await supabase
          .from('posts')
          .select('*')
          .in('id', parentPostIds);
        
        if (parentError) {
          console.error('Error fetching parent posts:', parentError);
        } else {
          parentPosts = parentPostsData || [];
          // Add parent post authors to authorIds for user data fetching
          const parentAuthorIds = parentPosts.map(p => p.author_id).filter(Boolean);
          authorIds.push(...parentAuthorIds);
        }
      }
      
      // Remove duplicates from authorIds
      const uniqueAuthorIds = [...new Set(authorIds)];
      
      // Fetch profile data for authenticated users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', uniqueAuthorIds);

      // Fetch temporary user data
      const { data: tempUsers } = await supabase
        .from('temporary_users')
        .select('id, display_name')
        .in('id', uniqueAuthorIds);

      // Helper function to enrich a post with user data
      const enrichPostWithUserData = (post: any) => {
        if (!post.author_id) {
          return { ...post, profiles: null };
        }

        // Check if it's a profile user
        const profile = profiles?.find(p => p.id === post.author_id);
        if (profile) {
          return {
            ...post,
            profiles: {
              username: profile.username,
              avatar_url: profile.avatar_url
            }
          };
        }

        // Check if it's a temporary user
        const tempUser = tempUsers?.find(t => t.id === post.author_id);
        if (tempUser) {
          return {
            ...post,
            profiles: {
              username: tempUser.display_name,
              avatar_url: null
            }
          };
        }

        // Fallback for unknown users
        return {
          ...post,
          profiles: {
            username: 'Anonymous User',
            avatar_url: null
          }
        };
      };

      // Enrich parent posts with user data
      const enrichedParentPosts = parentPosts.map(enrichPostWithUserData);
      
      // Create a map for quick parent post lookup
      const parentPostMap = new Map();
      enrichedParentPosts.forEach(parentPost => {
        parentPostMap.set(parentPost.id, parentPost);
      });

      // Enrich posts with user data and parent post information
      const enrichedPosts = posts.map(post => {
        const enrichedPost = enrichPostWithUserData(post);
        
        // Add parent post if it exists
        if (post.parent_post_id && parentPostMap.has(post.parent_post_id)) {
          enrichedPost.parent_post = parentPostMap.get(post.parent_post_id);
        }
        
        return enrichedPost;
      });
      
      console.log('Posts enriched with user data and parent posts:', enrichedPosts);
      return { posts: enrichedPosts as Post[], totalCount };
    },
    enabled: !!topicId,
  });
};
