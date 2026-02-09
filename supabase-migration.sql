-- De'Artisa Hub incremental schema updates
-- Run this if you already executed the original schema

-- Add per-view pricing columns if missing
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS min_rate INTEGER DEFAULT 0;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS max_rate INTEGER DEFAULT 0;

-- Create artist portfolio table if missing
CREATE TABLE IF NOT EXISTS artist_portfolio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE artist_portfolio ENABLE ROW LEVEL SECURITY;

-- Policies (safe create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view artist portfolio'
  ) THEN
    CREATE POLICY "Anyone can view artist portfolio"
      ON artist_portfolio FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can insert their own portfolio'
  ) THEN
    CREATE POLICY "Artists can insert their own portfolio"
      ON artist_portfolio FOR INSERT
      WITH CHECK (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_portfolio.artist_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can update their own portfolio'
  ) THEN
    CREATE POLICY "Artists can update their own portfolio"
      ON artist_portfolio FOR UPDATE
      USING (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_portfolio.artist_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can delete their own portfolio'
  ) THEN
    CREATE POLICY "Artists can delete their own portfolio"
      ON artist_portfolio FOR DELETE
      USING (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_portfolio.artist_id)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_artist_portfolio_artist_id ON artist_portfolio(artist_id);

-- Artist rates per specialty
CREATE TABLE IF NOT EXISTS artist_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  rate_type TEXT NOT NULL,
  min_price INTEGER DEFAULT 0,
  max_price INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (artist_id, specialty, rate_type)
);

ALTER TABLE artist_rates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view artist rates'
  ) THEN
    CREATE POLICY "Anyone can view artist rates"
      ON artist_rates FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can upsert their own rates'
  ) THEN
    CREATE POLICY "Artists can upsert their own rates"
      ON artist_rates FOR INSERT
      WITH CHECK (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_rates.artist_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can update their own rates'
  ) THEN
    CREATE POLICY "Artists can update their own rates"
      ON artist_rates FOR UPDATE
      USING (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_rates.artist_id)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_artist_rates_artist_id ON artist_rates(artist_id);

-- Client projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'open',
  reference_links TEXT[] DEFAULT '{}',
  selected_artist_id UUID REFERENCES artist_profiles(id),
  selected_quote_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Clients can manage their projects'
  ) THEN
    CREATE POLICY "Clients can manage their projects"
      ON projects FOR ALL
      USING (
        auth.uid() = (SELECT user_id FROM client_profiles WHERE client_profiles.id = projects.client_id)
      )
      WITH CHECK (
        auth.uid() = (SELECT user_id FROM client_profiles WHERE client_profiles.id = projects.client_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view open projects'
  ) THEN
    CREATE POLICY "Anyone can view open projects"
      ON projects FOR SELECT
      TO public
      USING (status = 'open');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can view assigned projects'
  ) THEN
    CREATE POLICY "Artists can view assigned projects"
      ON projects FOR SELECT
      USING (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = projects.selected_artist_id)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Project quotes
CREATE TABLE IF NOT EXISTS project_quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  timeline_days INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_quotes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can submit quotes'
  ) THEN
    CREATE POLICY "Artists can submit quotes"
      ON project_quotes FOR INSERT
      WITH CHECK (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = project_quotes.artist_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can update their quotes'
  ) THEN
    CREATE POLICY "Artists can update their quotes"
      ON project_quotes FOR UPDATE
      USING (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = project_quotes.artist_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can view their quotes'
  ) THEN
    CREATE POLICY "Artists can view their quotes"
      ON project_quotes FOR SELECT
      USING (
        auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = project_quotes.artist_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Clients can view project quotes'
  ) THEN
    CREATE POLICY "Clients can view project quotes"
      ON project_quotes FOR SELECT
      USING (
        auth.uid() = (
          SELECT user_id FROM client_profiles
          WHERE client_profiles.id = (SELECT client_id FROM projects WHERE projects.id = project_quotes.project_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Clients can update project quotes'
  ) THEN
    CREATE POLICY "Clients can update project quotes"
      ON project_quotes FOR UPDATE
      USING (
        auth.uid() = (
          SELECT user_id FROM client_profiles
          WHERE client_profiles.id = (SELECT client_id FROM projects WHERE projects.id = project_quotes.project_id)
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_quotes_project_id ON project_quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_quotes_artist_id ON project_quotes(artist_id);

-- Agreements
CREATE TABLE IF NOT EXISTS project_agreements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  terms_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  client_accepted_at TIMESTAMP WITH TIME ZONE,
  artist_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_agreements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Clients can create agreements'
  ) THEN
    CREATE POLICY "Clients can create agreements"
      ON project_agreements FOR INSERT
      WITH CHECK (
        auth.uid() = (SELECT user_id FROM client_profiles WHERE client_profiles.id = project_agreements.client_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Participants can view agreements'
  ) THEN
    CREATE POLICY "Participants can view agreements"
      ON project_agreements FOR SELECT
      USING (
        auth.uid() IN (
          SELECT user_id FROM client_profiles WHERE client_profiles.id = project_agreements.client_id
          UNION
          SELECT user_id FROM artist_profiles WHERE artist_profiles.id = project_agreements.artist_id
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Participants can update agreements'
  ) THEN
    CREATE POLICY "Participants can update agreements"
      ON project_agreements FOR UPDATE
      USING (
        auth.uid() IN (
          SELECT user_id FROM client_profiles WHERE client_profiles.id = project_agreements.client_id
          UNION
          SELECT user_id FROM artist_profiles WHERE artist_profiles.id = project_agreements.artist_id
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_agreements_project_id ON project_agreements(project_id);

-- Payments
CREATE TABLE IF NOT EXISTS project_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  provider TEXT DEFAULT 'razorpay',
  status TEXT DEFAULT 'created',
  order_id TEXT,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Clients can manage payments'
  ) THEN
    CREATE POLICY "Clients can manage payments"
      ON project_payments FOR ALL
      USING (
        auth.uid() = (SELECT user_id FROM client_profiles WHERE client_profiles.id = project_payments.client_id)
      )
      WITH CHECK (
        auth.uid() = (SELECT user_id FROM client_profiles WHERE client_profiles.id = project_payments.client_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Artists can view payments for assigned projects'
  ) THEN
    CREATE POLICY "Artists can view payments for assigned projects"
      ON project_payments FOR SELECT
      USING (
        auth.uid() = (
          SELECT user_id FROM artist_profiles
          WHERE artist_profiles.id = (SELECT selected_artist_id FROM projects WHERE projects.id = project_payments.project_id)
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_payments_project_id ON project_payments(project_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel TEXT NOT NULL,
  destination TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their notifications'
  ) THEN
    CREATE POLICY "Users can view their notifications"
      ON notifications FOR SELECT
      USING (auth.uid() = notifications.user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
