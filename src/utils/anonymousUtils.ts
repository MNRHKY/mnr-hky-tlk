
// Utility functions for anonymous posting
export const generateSessionId = (): string => {
  // Generate a unique session ID for anonymous users
  let sessionId = localStorage.getItem('anonymous_session_id');
  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('anonymous_session_id', sessionId);
  }
  return sessionId;
};

export const validateAnonymousContent = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for common image formats
  if (content.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)/i)) {
    errors.push('Images are not allowed in anonymous posts');
  }
  
  // Check for URLs (http/https)
  if (content.match(/https?:\/\/[^\s]+/i)) {
    errors.push('Links are not allowed in anonymous posts');
  }
  
  // Check for markdown image syntax
  if (content.match(/!\[.*\]\(.*\)/)) {
    errors.push('Image markdown is not allowed in anonymous posts');
  }
  
  // Check for markdown link syntax
  if (content.match(/\[.*\]\(.*\)/)) {
    errors.push('Link markdown is not allowed in anonymous posts');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getClientIP = async (): Promise<string> => {
  // In a real application, you'd get this from the server
  // For now, we'll use a placeholder
  return '127.0.0.1';
};
