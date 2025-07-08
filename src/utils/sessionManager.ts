import { supabase } from '@/integrations/supabase/client';

export interface TempUser {
  id: string;
  session_id: string;
  display_name: string;
  created_at: string;
  expires_at: string;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionId: string | null = null;
  private tempUserId: string | null = null;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async initializeSession(): Promise<string> {
    // Check if we have a valid session in localStorage
    const storedSessionId = localStorage.getItem('temp_session_id');
    const storedExpiry = localStorage.getItem('temp_session_expiry');
    const storedTempUserId = localStorage.getItem('temp_user_id');

    if (storedSessionId && storedExpiry && storedTempUserId) {
      const expiry = new Date(storedExpiry);
      if (expiry > new Date()) {
        // Session is still valid
        this.sessionId = storedSessionId;
        this.tempUserId = storedTempUserId;
        return this.tempUserId;
      }
    }

    // Create new session
    return this.createNewSession();
  }

  private async createNewSession(): Promise<string> {
    // Generate new session ID
    this.sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    
    try {
      // Get or create temporary user
      const { data, error } = await supabase.rpc('get_or_create_temp_user', {
        p_session_id: this.sessionId
      });

      if (error) {
        console.error('Error creating temp user:', error);
        throw error;
      }

      this.tempUserId = data;
      
      // Store in localStorage with 12-hour expiry
      const expiry = new Date(Date.now() + 12 * 60 * 60 * 1000);
      localStorage.setItem('temp_session_id', this.sessionId);
      localStorage.setItem('temp_user_id', this.tempUserId);
      localStorage.setItem('temp_session_expiry', expiry.toISOString());

      console.log('Created new temporary user session:', {
        sessionId: this.sessionId,
        tempUserId: this.tempUserId,
        expiry: expiry.toISOString()
      });

      return this.tempUserId;
    } catch (error) {
      console.error('Failed to create temp user session:', error);
      throw error;
    }
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getTempUserId(): string | null {
    return this.tempUserId;
  }

  async getTempUserData(): Promise<TempUser | null> {
    if (!this.tempUserId) return null;

    try {
      const { data, error } = await supabase
        .from('temporary_users')
        .select('*')
        .eq('id', this.tempUserId)
        .single();

      if (error) {
        console.error('Error fetching temp user data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch temp user data:', error);
      return null;
    }
  }

  clearSession(): void {
    this.sessionId = null;
    this.tempUserId = null;
    localStorage.removeItem('temp_session_id');
    localStorage.removeItem('temp_user_id');
    localStorage.removeItem('temp_session_expiry');
  }

  async checkRateLimit(): Promise<{ canPost: boolean; remainingPosts: number }> {
    if (!this.tempUserId || !this.sessionId) {
      return { canPost: false, remainingPosts: 0 };
    }

    try {
      // Get client IP for anonymous rate limiting
      const clientIP = await this.getClientIP();
      
      const { data, error } = await supabase.rpc('check_anonymous_rate_limit', {
        user_ip: clientIP,
        session_id: this.sessionId
      });

      if (error) {
        console.error('Error checking anonymous rate limit:', error);
        return { canPost: false, remainingPosts: 0 };
      }

      const canPost = data as boolean;
      
      // Get current post count from tracking table
      const { data: trackingData, error: trackingError } = await supabase
        .from('anonymous_post_tracking')
        .select('post_count')
        .or(`ip_address.eq.${clientIP},session_id.eq.${this.sessionId}`)
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (trackingError) {
        console.error('Error fetching tracking data:', trackingError);
      }

      const currentCount = trackingData?.post_count || 0;
      const remainingPosts = Math.max(0, 5 - currentCount);

      return { canPost, remainingPosts };
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      return { canPost: false, remainingPosts: 0 };
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '127.0.0.1';
    } catch (error) {
      console.warn('Failed to get real IP, using fallback');
      const userAgent = navigator.userAgent;
      const timestamp = Date.now();
      const hash = btoa(`${userAgent}-${timestamp}`).slice(0, 15);
      return `192.168.1.${hash.slice(-3).replace(/[^0-9]/g, '1')}`;
    }
  }

  async recordPost(): Promise<void> {
    if (!this.sessionId) {
      console.error('No session ID available for recording post');
      return;
    }

    try {
      const clientIP = await this.getClientIP();
      console.log('Recording anonymous post for IP:', clientIP, 'Session:', this.sessionId);
      
      await supabase.rpc('record_anonymous_post', {
        user_ip: clientIP,
        session_id: this.sessionId
      });
      
      console.log('Post recorded successfully');
    } catch (error) {
      console.error('Error recording anonymous post:', error);
    }
  }
}

export const sessionManager = SessionManager.getInstance();