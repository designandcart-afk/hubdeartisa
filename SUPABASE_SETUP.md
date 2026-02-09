# Supabase Setup Guide for De'Artisa Hub

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: DeArtisa Hub
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"** and wait for setup to complete (1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (under Project URL)
   - **anon public** key (under Project API keys)

## Step 3: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Add your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace the values with what you copied from Step 2
4. Save the file

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open the `supabase-schema.sql` file from your project root
4. Copy ALL the SQL code and paste it into the query editor
5. Click **"Run"** to execute the schema
6. You should see success messages - this creates:
   - `client_profiles` table
   - `artist_profiles` table
   - `user_roles` table
   - Row Level Security policies
   - Indexes for performance

## Step 5: Verify Database Setup

1. Go to **Table Editor** in Supabase
2. You should see three new tables:
   - `client_profiles`
   - `artist_profiles`
   - `user_roles`

## Step 6: Configure Email Settings (Optional but Recommended)

1. Go to **Authentication** → **Settings** → **Email**
2. Configure your email provider or use Supabase's default
3. Customize email templates if desired

## Step 7: Test Registration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/get-started`
3. Try registering as either a Client or Artist
4. Check your email for verification link
5. Verify in Supabase:
   - Go to **Authentication** → **Users** - you should see the new user
   - Go to **Table Editor** → select the appropriate profile table - you should see the profile data

## Troubleshooting

### "Invalid API credentials" error
- Double-check your `.env.local` file has the correct values
- Make sure you copied the **anon public** key, not the service role key
- Restart your dev server after changing environment variables

### "Failed to create profile" error
- Verify the database schema was created successfully
- Check the SQL Editor for any error messages
- Make sure Row Level Security policies are enabled

### User created but no profile data
- Check the browser console for errors
- Verify the table names in the schema match the code
- Ensure the user_id references are correct

## Next Steps

Once registration is working:

1. **Build Sign-In Page**: Create login functionality
2. **Add Dashboard**: Client and Artist dashboards
3. **Project Posting**: Allow clients to post projects
4. **Bidding System**: Let artists bid on projects
5. **Messaging**: Real-time chat between clients and artists
6. **File Upload**: Portfolio images using Supabase Storage

## Database Structure

### client_profiles
- Stores client account information
- Linked to auth.users via user_id
- Fields: name, email, location, phone

### artist_profiles
- Stores artist account information
- Linked to auth.users via user_id
- Fields: name, email, location, experience, specialties, languages, bio
- Publicly visible for browsing

### user_roles
- Tracks whether a user is a 'client' or 'artist'
- Used for authorization and routing to appropriate dashboards
