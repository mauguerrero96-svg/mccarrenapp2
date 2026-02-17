-- Create clubs table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_players INT,
    seeding_mode TEXT, -- e.g., 'random', 'elo', 'manual'
    status TEXT DEFAULT 'registration_open', -- e.g., 'registration_open', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament_players table (junction table for players registered in tournaments)
CREATE TABLE tournament_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming players are auth.users
    seed_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

-- Create brackets table
CREATE TABLE brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT, -- e.g., "Men's Singles", "Women's Doubles"
    format TEXT, -- e.g., 'single_elimination', 'round_robin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bracket_id UUID REFERENCES brackets(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    match_number_in_round INT NOT NULL,
    player1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    score TEXT, -- e.g., '6-3, 6-4'
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
    scheduled_time TIMESTAMP WITH TIME ZONE,
    court_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- For linking to next match in a single elimination bracket
    next_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    next_match_slot INT -- 1 for player1, 2 for player2 in the next match
);

-- Create announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- Organizer/Admin who published it
);

-- Create support_tickets table for Help Chatbot
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

