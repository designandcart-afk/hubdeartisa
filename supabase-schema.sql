-- De'Artisa Hub Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('client', 'artist');

-- Client Profiles Table
CREATE TABLE client_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artist Profiles Table
CREATE TABLE artist_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  experience TEXT NOT NULL,
  specialties TEXT[] NOT NULL,
  custom_specialty TEXT,
  languages TEXT NOT NULL,
  phone TEXT,
  min_rate INTEGER DEFAULT 0,
  max_rate INTEGER DEFAULT 0,
  bio TEXT NOT NULL,
  hourly_rate INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles Table (to track if user is client or artist)
CREATE TABLE user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artist Portfolio Table
CREATE TABLE artist_portfolio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
CREATE POLICY "Users can view their own client profile"
  ON client_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client profile"
  ON client_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client profile"
  ON client_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for artist_profiles
CREATE POLICY "Anyone can view artist profiles"
  ON artist_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own artist profile"
  ON artist_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist profile"
  ON artist_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for artist_portfolio
CREATE POLICY "Anyone can view artist portfolio"
  ON artist_portfolio FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Artists can insert their own portfolio"
  ON artist_portfolio FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_portfolio.artist_id)
  );

CREATE POLICY "Artists can update their own portfolio"
  ON artist_portfolio FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_portfolio.artist_id)
  );

CREATE POLICY "Artists can delete their own portfolio"
  ON artist_portfolio FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM artist_profiles WHERE artist_profiles.id = artist_portfolio.artist_id)
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX idx_client_profiles_email ON client_profiles(email);
CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_email ON artist_profiles(email);
CREATE INDEX idx_artist_profiles_specialties ON artist_profiles USING GIN(specialties);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_artist_portfolio_artist_id ON artist_portfolio(artist_id);
