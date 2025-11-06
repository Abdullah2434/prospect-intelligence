# Prospect Intelligence Dashboard

A modern, clean dashboard for generating, analyzing, and exporting prospect data. Built with Next.js, TypeScript, TailwindCSS, and Supabase.

## Features

- **Generate Prospects**: Input natural language audience descriptions and generate prospects via n8n webhook integration
- **Prospect List**: View, search, and filter all prospects in an interactive table
- **Relationships**: Analyze industry and location clusters to identify patterns
- **Export**: Export prospects to CSV or Google Sheets
- **Automatic Deduplication**: Prevents duplicate entries by checking name + company combinations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase
- **Icons**: Lucide React
- **Integration**: n8n Webhook

## Project Structure

```
prospect-intelligence-dashboard/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   └── generate-prospects/   # n8n webhook handler
│   ├── generate/                 # Generate prospects page
│   ├── prospects/                # Prospect list page
│   ├── relationships/            # Relationships analysis page
│   ├── export/                   # Export page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects to /generate)
│   └── globals.css               # Global styles
├── components/                   # React components
│   └── layout/
│       └── DashboardLayout.tsx   # Main dashboard layout with sidebar
├── lib/                          # Utility libraries
│   ├── supabase.ts              # Supabase client configuration
│   ├── prospects.ts              # Prospect CRUD operations
│   └── export.ts                 # Export utilities
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # TailwindCSS configuration
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase project
- An n8n webhook URL (optional for testing)

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. **Set up Supabase database**:
   
   Run this SQL in your Supabase SQL editor to create the `prospect_entities` table:
   ```sql
   CREATE TABLE prospect_entities (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     search_request_id UUID,
     name TEXT NOT NULL,
     company_name TEXT NOT NULL,
     role TEXT NOT NULL,
     location TEXT NOT NULL,
     industry TEXT NOT NULL,
     email TEXT,
     summary TEXT,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create indexes for better query performance
   CREATE INDEX idx_prospect_entities_name_company ON prospect_entities(name, company_name);
   CREATE INDEX idx_prospect_entities_industry ON prospect_entities(industry);
   CREATE INDEX idx_prospect_entities_location ON prospect_entities(location);
   CREATE INDEX idx_prospect_entities_created_at ON prospect_entities(created_at DESC);
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**:
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Generate Prospects

1. Navigate to the **Generate Prospects** page
2. Enter a natural language description of your target audience
3. Click **Generate Prospects**
4. The system will:
   - Call your n8n webhook with the query
   - Process the response
   - Store prospects in Supabase with automatic deduplication
   - Redirect you to the Prospect List page

### View and Filter Prospects

1. Go to the **Prospect List** page
2. Use the search bar to filter by name or company
3. Use dropdown filters to filter by industry or location
4. Click **View More** on any summary to see the full text

### Analyze Relationships

1. Visit the **Relationships** page
2. View industry clusters to see which industries are most represented
3. View location clusters to see geographic distribution
4. Use the visual progress bars to quickly identify patterns

### Export Data

1. Go to the **Export** page
2. Choose to export **All Prospects** or **Filtered View**
3. Click **Export to CSV** to download a CSV file
4. Click **Export to Google Sheets** to copy data to clipboard and open Google Sheets

## n8n Webhook Integration

The dashboard expects your n8n webhook to:

1. Accept a POST request with JSON body:
   ```json
   {
     "query_text": "Your audience description"
   }
   ```

2. Return a JSON response with prospects array:
   ```json
   {
     "prospects": [
       {
         "name": "John Doe",
         "company_name": "Acme Corp",
         "role": "CEO",
         "location": "New York, USA",
         "industry": "Technology",
         "email": "john@acme.com",
         "summary": "AI-generated summary..."
       }
     ]
   }
   ```

   Or simply return an array:
   ```json
   [
     {
       "name": "John Doe",
       ...
     }
   ]
   ```

## Deduplication Logic

The system automatically prevents duplicate entries by:

1. Checking if a prospect with the same `name` + `company_name` already exists
2. If a duplicate is found:
   - The new entry is NOT inserted
   - The context is appended to the existing prospect's `notes` field with a timestamp
3. If no duplicate exists:
   - The prospect is inserted as a new record

## API Routes

### POST `/api/generate-prospects`

Generates prospects via n8n webhook and stores them in Supabase.

**Request Body**:
```json
{
  "query_text": "Your audience description"
}
```

**Response**:
```json
{
  "message": "Prospects generated successfully",
  "inserted": 10,
  "duplicates": 2,
  "errors": 0
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | Your n8n webhook URL | Yes |

## Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.

---

**Note**: Make sure to configure your Supabase RLS (Row Level Security) policies appropriately for your use case. The current implementation uses the anonymous key, which should be restricted based on your security requirements.

