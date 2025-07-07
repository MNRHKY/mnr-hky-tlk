// Anonymous session management
const ANONYMOUS_SESSION_KEY = 'anonymous_session_id';

export const getAnonymousSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ANONYMOUS_SESSION_KEY);
};

export const createAnonymousSessionId = (): string => {
  const sessionId = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  if (typeof window !== 'undefined') {
    localStorage.setItem(ANONYMOUS_SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const getOrCreateAnonymousSessionId = (): string => {
  return getAnonymousSessionId() || createAnonymousSessionId();
};