-- Disable moderation for the Spring/Summer Canada category
UPDATE public.categories 
SET requires_moderation = false 
WHERE slug = 'spring-summer-canada';

-- Approve the existing pending topic in this category
UPDATE public.topics 
SET moderation_status = 'approved' 
WHERE category_id = (
  SELECT id FROM public.categories WHERE slug = 'spring-summer-canada'
) AND moderation_status = 'pending';