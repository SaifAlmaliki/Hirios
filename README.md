# Hirios - Job Portal Application

## Overview

Hirios is a comprehensive job portal application that connects job seekers with companies. It provides a dual-interface platform where companies can post jobs and manage applications, while job seekers can browse opportunities and apply for positions. The application features modern UI components, real-time data management, and integrated file handling for resume uploads.

## 🚀 Features

### For Job Seekers
- **Job Browsing**: View all available job postings with detailed information
- **Advanced Job Search**: Filter jobs by location, employment type, and company
- **Easy Application Process**: Apply to jobs with resume upload functionality
- **Application Tracking**: Monitor application status and history
- **Responsive Design**: Optimized for desktop and mobile devices

### For Companies
- **Company Profile Management**: Complete company setup with branding and information
- **Job Posting**: Create and manage job listings with detailed descriptions
- **Application Management**: View and manage candidate applications
- **Dashboard Analytics**: Overview of job postings and application metrics
- **Resume Management**: Access and review candidate resumes
- **Subscription System**: Built-in subscription management (currently bypassed for demo)

### Core Features
- **Dual User Types**: Separate interfaces for job seekers and companies
- **Real-time Updates**: Live data synchronization using React Query
- **File Upload**: Secure resume storage using Supabase Storage
- **Responsive UI**: Modern design using shadcn/ui components
- **Authentication**: Secure user management with Supabase Auth
- **Webhook Integration**: External API integration for application processing

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **React Router** for client-side routing
- **TanStack React Query** for server state management
- **shadcn/ui** for consistent UI components
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend & Database
- **Supabase** as Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication system
  - File storage
  - Row Level Security (RLS)

### Key Libraries & Dependencies
```json
{
  "@supabase/supabase-js": "^2.50.3",
  "@tanstack/react-query": "^5.56.2",
  "react-hook-form": "^7.53.0",
  "react-router-dom": "^6.28.0",
  "@radix-ui/*": "Various UI primitives",
  "tailwindcss": "^3.4.1"
}
```

## 📊 Database Schema

### Core Tables

#### `profiles`
- **Purpose**: Basic user information and user type identification
- **Fields**:
  - `id` (UUID, FK to auth.users)
  - `email` (TEXT)
  - `user_type` (TEXT: 'job_seeker' | 'company')
  - `created_at`, `updated_at` (TIMESTAMPTZ)

#### `company_profiles`
- **Purpose**: Extended company information and subscription management
- **Fields**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, FK to auth.users)
  - `company_name`, `company_description` (TEXT)
  - `company_website`, `company_size`, `industry` (TEXT)
  - `address`, `phone`, `logo_url` (TEXT)
  - `subscription_status` (TEXT: 'active' | 'inactive' | 'cancelled')
  - `subscription_end_date` (TIMESTAMPTZ)
  - `stripe_customer_id` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMPTZ)

#### `jobs`
- **Purpose**: Job postings created by companies
- **Fields**:
  - `id` (UUID, Primary Key)
  - `company_profile_id` (UUID, FK to company_profiles)
  - `title`, `department`, `location` (TEXT, Required)
  - `employment_type` (TEXT: full-time, part-time, contract, etc.)
  - `description`, `requirements`, `benefits` (TEXT)
  - `company`, `salary` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMPTZ)

#### `applications`
- **Purpose**: Job applications submitted by job seekers
- **Fields**:
  - `id` (UUID, Primary Key)
  - `job_id` (UUID, FK to jobs)
  - `full_name`, `email`, `phone` (TEXT, Required)
  - `resume_url` (TEXT, URL to stored resume)
  - `status` (TEXT, Default: 'pending')
  - `created_at` (TIMESTAMPTZ)

#### `screening_results`
- **Purpose**: AI/automated screening results for applications
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name`, `email`, `phone_number`, `job_role` (TEXT)
  - `resume` (TEXT, Resume content)
  - `fit_score` (INTEGER, 0-100 score)
  - `screening_result` (TEXT, Detailed analysis)
  - `created_at`, `updated_at` (TIMESTAMPTZ)

### Storage Buckets
- **`resumes`**: Public bucket for storing job application resumes (PDF files)

## 🔐 Authentication System

### Authentication Flow
1. **User Registration**: Users sign up with email/password and select user type
2. **Email Verification**: Supabase sends confirmation email
3. **Profile Creation**: Automatic profile creation with user type
4. **Company Setup**: Companies complete additional profile information
5. **Session Management**: Persistent sessions with automatic refresh

### User Types
- **`job_seeker`**: Can browse jobs and submit applications
- **`company`**: Can post jobs and manage applications

### Security Features
- **Row Level Security (RLS)**: Database-level security policies
- **Authentication State Management**: React Context for global auth state
- **Protected Routes**: Route-level authentication checks
- **Secure File Upload**: Authenticated file storage

### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: string | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
```

## 🔧 Environment Variables

### Environment Configuration
The application uses environment variables stored in `.env.local` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://bwuomwyodoyyrqgdlwrp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Webhook Configuration  
VITE_WEBHOOK_URL=https://n8n.cognitechx.com/webhook-test/Hirios

# Application Configuration
VITE_APP_NAME=Hirios
VITE_APP_DESCRIPTION=Job Portal Application
```

### Required Environment Variables
- **`VITE_SUPABASE_URL`**: Your Supabase project URL
- **`VITE_SUPABASE_ANON_KEY`**: Your Supabase anonymous key
- **`VITE_WEBHOOK_URL`**: External webhook endpoint for application processing
- **`VITE_APP_NAME`**: Application name (optional)
- **`VITE_APP_DESCRIPTION`**: Application description (optional)

### Environment Setup for Development
1. Copy `.env.example` to `.env` in the project root
   ```bash
   cp .env.example .env
   ```
2. Update the values in `.env` with your actual configuration:
   - Replace `your_supabase_project_url` with your Supabase project URL
   - Replace `your_supabase_anon_key` with your Supabase anonymous key
   - Replace `your_webhook_endpoint_url` with your webhook URL
3. The application will automatically validate required environment variables on startup

**Note**: All environment variables must be prefixed with `VITE_` to be accessible in the frontend application.

## 🗂️ Project Structure

```
Hirios/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ApplicationCard.tsx
│   │   ├── CompanyView.tsx   # Company dashboard
│   │   ├── UserView.tsx      # Job seeker interface
│   │   └── JobApplicationsView.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx   # Authentication state
│   ├── hooks/               # Custom React hooks
│   │   ├── useJobs.ts       # Job management
│   │   ├── useApplications.ts # Application management
│   │   ├── useCompanyJobs.ts # Company-specific jobs
│   │   └── useScreeningResults.ts
│   ├── integrations/        # External service integrations
│   │   └── supabase/        # Supabase client and types
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Landing page
│   │   ├── Auth.tsx         # Authentication page
│   │   ├── JobPortal.tsx    # Main application page
│   │   ├── CompanySetup.tsx # Company onboarding
│   │   └── Subscription.tsx # Subscription management
│   ├── services/            # External API services
│   │   └── webhookService.ts # Webhook integration
│   └── main.tsx             # Application entry point
├── supabase/
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase configuration
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── vite.config.ts          # Vite configuration
```

## 🔄 Data Flow

### Job Posting Flow (Company)
1. Company signs up and completes profile setup
2. Company creates job posting through `CompanyView`
3. Job data saved to `jobs` table with `company_profile_id`
4. Real-time updates via React Query invalidation

### Job Application Flow (Job Seeker)
1. Job seeker browses jobs in `UserView`
2. Selects job and fills application form
3. Resume uploaded to Supabase Storage
4. Application data saved to `applications` table
5. Webhook triggered to external processing system
6. Optional: AI screening results stored in `screening_results`

### Authentication Flow
1. User registration/login via Supabase Auth
2. Profile creation with user type
3. Context state updates trigger UI changes
4. Protected routes enforce authentication

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hirios
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:8080
   - The app will run on port 8080 by default

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🚀 Deployment

### Production Deployment
The application is designed for deployment on modern hosting platforms:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy static files**
   - The `dist` folder contains the built application
   - Deploy to Vercel, Netlify, or similar platforms

3. **Environment Configuration**
   - Update hardcoded values in production
   - Use proper environment variables
   - Configure domain settings

### Supabase Configuration
- Database is hosted on Supabase cloud
- No additional backend deployment needed
- Ensure RLS policies are properly configured for production

## 🔒 Security Considerations

### Current Security Status
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Authentication required for sensitive operations
- ✅ File upload restrictions (PDF only for resumes)
- ✅ Environment variables properly configured
- ⚠️ Some tables have public access policies for demo purposes

### Production Security Recommendations
1. **RLS Policies**: Review and restrict public access policies
3. **File Upload**: Implement file size limits and virus scanning
4. **Rate Limiting**: Add API rate limiting
5. **HTTPS**: Ensure all communications are encrypted
6. **Input Validation**: Add comprehensive input sanitization

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use existing UI components from shadcn/ui
3. Implement proper error handling
4. Add loading states for async operations
5. Follow the established folder structure

### Code Style
- ESLint configuration is included
- Use Prettier for code formatting
- Follow React hooks best practices
- Use TypeScript for type safety

## 📄 License

This project is part of the Lovable platform ecosystem.

## 🔗 External Integrations

### Webhook Service
- **Purpose**: Send application data to external processing systems
- **URL**: `https://n8n.cognitechx.com/webhook-test/Hirios`
- **Data**: Application details with base64-encoded resume

### Supabase Services Used
- **Database**: PostgreSQL with real-time capabilities
- **Authentication**: Email/password authentication
- **Storage**: File storage for resume uploads
- **Edge Functions**: Not currently used but available

## 📞 Support

For technical support or questions about the application:
- Review the code documentation
- Check Supabase dashboard for database issues
- Examine browser console for client-side errors
- Review network tab for API call failures

---

**Built with ❤️ using React, TypeScript, Supabase, and shadcn/ui**
