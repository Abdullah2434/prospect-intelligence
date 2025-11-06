# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

## Step 3: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script

## Step 4: Run the Development Server

```bash
npm run dev
```

## Step 5: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

### TypeScript Errors Before Installation

If you see TypeScript errors before running `npm install`, this is normal. The errors will resolve after installing dependencies.

### Supabase Connection Issues

- Verify your Supabase URL and anon key are correct
- Check that RLS (Row Level Security) policies allow public access if needed
- Ensure the `prospect_entities` table exists

### n8n Webhook Issues

- Verify your webhook URL is correct
- Test the webhook directly with a tool like Postman
- Check that the webhook returns data in the expected format

---

## Project Structure Overview

```
prospect-intelligence-dashboard/
├── app/                    # Next.js pages and API routes
├── components/             # React components
├── lib/                    # Utility functions
├── public/                 # Static assets
└── supabase-schema.sql     # Database schema
```

For detailed documentation, see [README.md](./README.md)

