# Baby Project Database Setup Guide

## Quick Setup (5 minutes)

Since the scripts can't execute SQL directly due to Supabase security, please follow these steps:

### 1. Access Supabase Dashboard
- Go to: https://rogrzxjxtypzsempesrf.supabase.co
- Sign in with your credentials

### 2. Open SQL Editor
- Click on "SQL Editor" in the sidebar
- Click "New query" to open a new SQL editor window

### 3. Execute the Schema
- Copy the entire content from `scripts/baby-project-schema.sql`
- Paste it into the SQL Editor
- Click "Run" (or press Ctrl+Enter)

### 4. Verify Setup
After execution, you should see:
- ✅ Tables created: projects, milestones, activities, measurements, health_records, users, project_collaborators
- ✅ Types created: project_status, milestone_type, activity_type
- ✅ Functions and triggers for updated_at timestamps
- ✅ Indexes for performance
- ✅ Sample data inserted

## What Gets Created

### Tables
1. **projects** - Main project tracking
2. **milestones** - Baby milestones (physical, cognitive, social, emotional, health)
3. **activities** - Daily activities (feeding, sleeping, playing, etc.)
4. **measurements** - Growth tracking (weight, height, head circumference)
5. **health_records** - Medical records (vaccinations, checkups, etc.)
6. **users** - User management
7. **project_collaborators** - Sharing/permissions

### Features
- Row Level Security (RLS) enabled on all tables
- Automatic timestamp triggers
- Helper functions for statistics
- Sample "Baby" project with demo milestones
- Admin user: admin@babyproject.com

## Next Steps After Setup

1. **Test the Connection** (in your app):
   ```javascript
   const { data, error } = await supabase
     .from('projects')
     .select('*')
     .eq('name', 'baby')
   ```

2. **Add Your First Milestone**:
   ```javascript
   const { data, error } = await supabase
     .from('milestones')
     .insert([{
       project_id: 'baby-project-id',
       title: 'First Smile',
       description: 'Baby smiled for the first time!',
       milestone_type: 'emotional',
       milestone_date: new Date().toISOString().split('T')[0]
     }])
   ```

3. **Track Daily Activities**:
   ```javascript
   const { data, error } = await supabase
     .from('activities')
     .insert([{
       project_id: 'baby-project-id',
       activity_type: 'feeding',
       title: 'Morning Feeding',
       activity_date: new Date().toISOString().split('T')[0],
       start_time: '08:00',
       duration: 30
     }])
   ```

## Viewing the Data

### Table Editor
- Go to: https://rogrzxjxtypzsempesrf.supabase.co/project/editor
- Browse all tables and data

### API Documentation
- Auto-generated REST API at: https://rogrzxjxtypzsempesrf.supabase.co/rest/v1/

## Support

If you encounter any issues:
1. Check the SQL execution log for errors
2. Verify all tables were created in the Table Editor
3. Ensure the "Baby" project exists in the projects table

## Security Notes

- The schema includes Row Level Security (RLS) policies
- Users can only access their own data
- Collaborator permissions are controlled through project_collaborators table
- Service role key has full access (use carefully!)