-- Fix the ambiguous column reference in analyze_content_for_spam function
CREATE OR REPLACE FUNCTION public.analyze_content_for_spam(content_text text, content_type text DEFAULT 'post'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  content_config jsonb;
  content_hash_var text;  -- Renamed to avoid conflict
  spam_indicators jsonb := '{}';
  is_spam boolean := false;
  confidence decimal(3,2) := 0.00;
  similar_count integer;
  normalized_content text;
BEGIN
  -- Get content filtering configuration
  SELECT config_value INTO content_config 
  FROM public.spam_detection_config 
  WHERE config_key = 'content_filters' AND is_active = true;

  -- Normalize content for analysis
  normalized_content := lower(trim(regexp_replace(content_text, '\s+', ' ', 'g')));
  content_hash_var := encode(sha256(normalized_content::bytea), 'hex');

  -- Check minimum content length
  IF length(normalized_content) < COALESCE((content_config->>'min_content_length')::integer, 10) THEN
    spam_indicators := spam_indicators || jsonb_build_object('too_short', true);
    confidence := confidence + 0.3;
  END IF;

  -- Check for Lorem Ipsum patterns
  IF content_config IS NOT NULL AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(content_config->'lorem_ipsum_patterns') AS pattern
    WHERE normalized_content LIKE '%' || pattern || '%'
  ) THEN
    spam_indicators := spam_indicators || jsonb_build_object('lorem_ipsum', true);
    confidence := confidence + 0.8;
    is_spam := true;
  END IF;

  -- Check for spam keywords
  IF content_config IS NOT NULL AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(content_config->'spam_keywords') AS keyword
    WHERE normalized_content LIKE '%' || keyword || '%'
  ) THEN
    spam_indicators := spam_indicators || jsonb_build_object('spam_keywords', true);
    confidence := confidence + 0.6;
  END IF;

  -- Check for duplicate content (FIXED: use local variable name)
  SELECT COUNT(*) INTO similar_count
  FROM public.content_analysis ca
  WHERE ca.content_hash = content_hash_var
    AND ca.created_at > (now() - interval '24 hours');

  IF similar_count > 0 THEN
    spam_indicators := spam_indicators || jsonb_build_object('duplicate_content', true, 'duplicate_count', similar_count);
    confidence := confidence + (similar_count * 0.2);
  END IF;

  -- Determine if content is spam
  IF confidence >= 0.7 THEN
    is_spam := true;
  END IF;

  -- Store analysis results
  INSERT INTO public.content_analysis (
    content_hash, content_type, spam_indicators, is_spam, confidence_score
  ) VALUES (
    content_hash_var, content_type, spam_indicators, is_spam, LEAST(confidence, 1.00)
  );

  RETURN jsonb_build_object(
    'is_spam', is_spam,
    'confidence', LEAST(confidence, 1.00),
    'indicators', spam_indicators,
    'content_hash', content_hash_var
  );
END;
$function$;