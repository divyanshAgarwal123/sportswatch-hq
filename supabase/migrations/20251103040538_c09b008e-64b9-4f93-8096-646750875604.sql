-- Add tokens column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tokens integer NOT NULL DEFAULT 0;

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  match_id text NOT NULL,
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Create team_players table
CREATE TABLE IF NOT EXISTS public.team_players (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  player_role text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view their own teams" 
ON public.teams 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams" 
ON public.teams 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams" 
ON public.teams 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for team_players
CREATE POLICY "Users can view players in their teams" 
ON public.team_players 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id = team_players.team_id 
    AND teams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add players to their teams" 
ON public.team_players 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id = team_players.team_id 
    AND teams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update players in their teams" 
ON public.team_players 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id = team_players.team_id 
    AND teams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete players from their teams" 
ON public.team_players 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id = team_players.team_id 
    AND teams.user_id = auth.uid()
  )
);

-- Update handle_new_user function to give 100 tokens on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (id, username, total_points, wins, matches_played, tokens)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    0,
    0,
    0,
    100
  );
  return new;
end;
$$;

-- Trigger for updating team updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Stored procedure to deduct tokens when creating a team
CREATE OR REPLACE FUNCTION public.deduct_tokens_for_team(
  _user_id uuid,
  _amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_tokens integer;
BEGIN
  -- Get current tokens
  SELECT tokens INTO current_tokens 
  FROM public.profiles 
  WHERE id = _user_id;
  
  -- Check if user has enough tokens
  IF current_tokens < _amount THEN
    RETURN false;
  END IF;
  
  -- Deduct tokens
  UPDATE public.profiles 
  SET tokens = tokens - _amount 
  WHERE id = _user_id;
  
  RETURN true;
END;
$$;

-- Stored procedure to add tokens
CREATE OR REPLACE FUNCTION public.add_tokens(
  _user_id uuid,
  _amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET tokens = tokens + _amount 
  WHERE id = _user_id;
END;
$$;

-- Function to get user's teams with player count
CREATE OR REPLACE FUNCTION public.get_user_teams(_user_id uuid)
RETURNS TABLE (
  team_id uuid,
  team_name text,
  match_id text,
  total_score integer,
  player_count bigint,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id as team_id,
    t.team_name,
    t.match_id,
    t.total_score,
    COUNT(tp.id) as player_count,
    t.created_at
  FROM public.teams t
  LEFT JOIN public.team_players tp ON t.id = tp.team_id
  WHERE t.user_id = _user_id
  GROUP BY t.id, t.team_name, t.match_id, t.total_score, t.created_at
  ORDER BY t.created_at DESC;
$$;

-- Trigger to automatically calculate team score when players are added/updated
CREATE OR REPLACE FUNCTION public.update_team_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.teams
  SET total_score = (
    SELECT COALESCE(SUM(points), 0)
    FROM public.team_players
    WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
  )
  WHERE id = COALESCE(NEW.team_id, OLD.team_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for team score calculation
CREATE TRIGGER update_team_score_on_player_insert
AFTER INSERT ON public.team_players
FOR EACH ROW
EXECUTE FUNCTION public.update_team_score();

CREATE TRIGGER update_team_score_on_player_update
AFTER UPDATE ON public.team_players
FOR EACH ROW
EXECUTE FUNCTION public.update_team_score();

CREATE TRIGGER update_team_score_on_player_delete
AFTER DELETE ON public.team_players
FOR EACH ROW
EXECUTE FUNCTION public.update_team_score();