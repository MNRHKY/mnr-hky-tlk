export interface Vote {
  id: string;
  user_id: string | null;
  vote_type: number; // -1 for downvote, 1 for upvote
  created_at: string;
  anonymous_ip?: string | null;
  anonymous_session_id?: string | null;
}