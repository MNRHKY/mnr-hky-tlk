import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'topic' | 'post' | 'category';
  author_username: string;
  category_name: string;
  category_color: string;
  reply_count: number;
  view_count: number;
  created_at: string;
  is_anonymous: boolean;
}

export type SearchFilter = 'all' | 'categories' | 'topics' | 'posts';

export const useSearch = (query: string, filter: SearchFilter = 'all') => {
  return useQuery({
    queryKey: ['search', query, filter],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = query.trim();
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      const results: SearchResult[] = [];
      
      // Search in topics (if filter allows)
      if (filter === 'all' || filter === 'topics') {
        let topicQuery = supabase
          .from('topics')
          .select(`
            id,
            title,
            content,
            created_at,
            reply_count,
            view_count,
            is_anonymous,
            profiles:author_id (username),
            categories (name, color)
          `);

        // For multiple words, get broader results and filter client-side
        const searchConditions = searchWords.map(word => 
          `title.ilike.%${word}%,content.ilike.%${word}%`
        ).join(',');
        
        const { data: topicResults, error: topicError } = await topicQuery
          .or(searchConditions)
          .order('created_at', { ascending: false })
          .limit(200); // Increased limit for client-side filtering

        if (topicError) {
          console.error('Error searching topics:', topicError);
          throw topicError;
        }

        // Filter results client-side to ensure ALL words are present
        const filteredTopics = topicResults?.filter((topic) => {
          const titleContent = `${topic.title} ${topic.content || ''}`.toLowerCase();
          return searchWords.every(word => 
            titleContent.includes(word.toLowerCase())
          );
        }) || [];

        // Add topic results
        filteredTopics.forEach((topic) => {
          results.push({
            id: topic.id,
            title: topic.title,
            content: topic.content || '',
            type: 'topic',
            author_username: topic.is_anonymous ? 'Anonymous' : (topic.profiles?.username || 'Unknown'),
            category_name: topic.categories?.name || 'Unknown',
            category_color: topic.categories?.color || '#3b82f6',
            reply_count: topic.reply_count || 0,
            view_count: topic.view_count || 0,
            created_at: topic.created_at,
            is_anonymous: topic.is_anonymous || false,
          });
        });
      }

      // Search in posts (if filter allows)
      if (filter === 'all' || filter === 'posts') {
        // For posts, search in content field
        const searchConditions = searchWords.map(word => 
          `content.ilike.%${word}%`
        ).join(',');

        const { data: postResults, error: postError } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            is_anonymous,
            profiles:author_id (username),
            topics!inner (
              id,
              title,
              reply_count,
              view_count,
              categories (name, color)
            )
          `)
          .or(searchConditions)
          .order('created_at', { ascending: false })
          .limit(200); // Increased limit for client-side filtering

        if (postError) {
          console.error('Error searching posts:', postError);
          throw postError;
        }

        // Filter results client-side to ensure ALL words are present
        const filteredPosts = postResults?.filter((post) => {
          const content = post.content.toLowerCase();
          return searchWords.every(word => 
            content.includes(word.toLowerCase())
          );
        }) || [];

        // Add post results
        filteredPosts.forEach((post) => {
          results.push({
            id: post.id,
            title: post.topics.title,
            content: post.content,
            type: 'post',
            author_username: post.is_anonymous ? 'Anonymous' : (post.profiles?.username || 'Unknown'),
            category_name: post.topics.categories?.name || 'Unknown',
            category_color: post.topics.categories?.color || '#3b82f6',
            reply_count: post.topics.reply_count || 0,
            view_count: post.topics.view_count || 0,
            created_at: post.created_at,
            is_anonymous: post.is_anonymous || false,
          });
        });
      }

      // Search in categories (if filter allows)
      if (filter === 'all' || filter === 'categories') {
        // For categories, search in name and description
        const searchConditions = searchWords.map(word => 
          `name.ilike.%${word}%,description.ilike.%${word}%`
        ).join(',');

        const { data: categoryResults, error: categoryError } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            description,
            color,
            created_at
          `)
          .or(searchConditions)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(100); // Increased limit for client-side filtering

        if (categoryError) {
          console.error('Error searching categories:', categoryError);
          throw categoryError;
        }

        // Filter results client-side to ensure ALL words are present
        const filteredCategories = categoryResults?.filter((category) => {
          const nameDescription = `${category.name} ${category.description || ''}`.toLowerCase();
          return searchWords.every(word => 
            nameDescription.includes(word.toLowerCase())
          );
        }) || [];

        // Add category results
        filteredCategories.forEach((category) => {
          results.push({
            id: category.id,
            title: category.name,
            content: category.description || '',
            type: 'category',
            author_username: 'System',
            category_name: category.name,
            category_color: category.color || '#3b82f6',
            reply_count: 0,
            view_count: 0,
            created_at: category.created_at,
            is_anonymous: false,
          });
        });
      }

      // Sort by creation date (most recent first)
      return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!query && query.trim().length >= 2,
  });
};