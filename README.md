# Hirios - AI-Powered Job Portal Application

## Overview

Hirios is a comprehensive AI-powered B2B recruitment platform designed exclusively for companies and recruiters. It provides advanced screening and interview technology to help companies manage their entire recruitment process. The platform enables companies to post jobs, manage applications, conduct AI-powered candidate screening and voice interviews, and collaborate with their hiring teams. The application features modern UI components with beautiful Aurora backgrounds, real-time data management, and integrated AI services for enhanced recruitment workflows.

## 🚀 Features

### For Companies & Recruiters
- **Company Profile Management**: Complete company setup with branding and subscription management
- **Job Posting**: Create and manage job listings with monthly posting limits
- **Application Management**: View and manage candidate applications with full-text search
- **Dashboard Analytics**: Overview of job postings and application metrics
- **Resume Management**: Access and review candidate resumes with extracted text content
- **Resume Pool**: Centralized resume storage pool for managing company's resume collection
- **AI Screening Results**: Review AI-generated candidate fit scores and insights
- **Direct Interview Link**: Generate and copy candidate interview links
- **Voice Interview (AI)**: Start AI-powered voice interviews for screened candidates
- **Subscription Management**: Track subscription plans and monthly job posting limits
- **Beautiful UI**: Modern Aurora background animations and glassmorphism design
- **Premium features**: Marked as "Coming Soon" in UI

### Team Collaboration
- **Job Collaboration System**: Invite hiring managers and recruiters to collaborate on specific job postings
- **Shared Job Management**: Team members can edit, view, and manage specific job postings together
- **Email-Based Invitations**: Seamlessly invite colleagues by email to join your hiring team
- **Role-Based Access**: Assign different roles (collaborator, etc.) to team members
- **Per-Job Access Control**: Grant collaboration access on a per-job basis for focused teamwork
- **Real-Time Collaboration**: Team members can work together on candidate evaluation and job management
- **Invitation Tracking**: Track who invited whom and when for audit purposes

### Points & Payment System
- **Point Packages**: Pre-defined point packages available for purchase
- **Transaction Tracking**: Complete history of all points earned and spent
- **User Balance Management**: Real-time points balance tracking for each user
- **Reference Linking**: Points transactions linked to specific actions (job postings, screenings, etc.)
- **Flexible Pricing**: Support for different point packages with varying prices
- **Transaction Types**: Categorized transactions (purchase, earned, spent, etc.)
- **Audit Trail**: Complete audit trail for all points-related activities

### AI & RAG System
- **Vector Search**: AI-powered semantic search using embeddings
- **Document Processing**: Store and process documents with metadata
- **RAG Integration**: Retrieval-Augmented Generation for enhanced AI responses
- **Embedding Storage**: Efficient storage of AI-generated embeddings
- **Metadata Support**: Rich metadata storage for enhanced document context

### Core Features
- **B2B Focus**: Exclusively designed for companies and recruiters
- **Real-time Updates**: Live data synchronization using React Query
- **File Upload & Processing**: Secure resume storage with automatic text extraction
- **Full-text Search**: GIN-indexed resume text search for efficient candidate discovery
- **Vector Search**: AI-powered semantic search using embeddings for document retrieval
- **Subscription Management**: Track company subscription plans and monthly job posting limits
- **Points System**: Complete points-based payment and transaction tracking
- **AI Screening**: Comprehensive candidate evaluation with voice interview capabilities
- **RAG Integration**: Retrieval-Augmented Generation for AI-powered document processing
- **Responsive UI**: Modern design using shadcn/ui components with Aurora backgrounds
- **Authentication**: Secure user management with Supabase Auth
- **Team Collaboration**: Email-based invitation system for collaborative hiring
- **Webhook Integration**: External workflow trigger for screening-related events
- **Voice AI Integration**: ElevenLabs Realtime Conversations for interviews

## 🚀 Development Status
- ✅ **Core Application**: Fully functional B2B recruitment platform
- ✅ **Authentication System**: Complete user management with Supabase Auth
- ✅ **AI Screening**: Integrated AI-powered candidate screening with comprehensive evaluation
- ✅ **Voice Interviews**: ElevenLabs integration for AI voice interviews
- ✅ **Team Collaboration**: Email-based invitation system for collaborative hiring
- ✅ **Resume Processing**: Automatic text extraction and full-text search capabilities
- ✅ **Resume Pool**: Centralized resume storage and management system for companies
- ✅ **Subscription Management**: Company subscription plans and monthly job posting limits
- ✅ **Points System**: Complete points-based payment and transaction tracking
- ✅ **RAG Integration**: Vector search and AI-powered document processing
- ✅ **Modern UI**: Beautiful Aurora backgrounds and glassmorphism design
- ✅ **Responsive Design**: Optimized for all device types
- ✅ **Aurora Backgrounds**: Animated gradient backgrounds across all pages
- ✅ **Glassmorphism Effects**: Modern semi-transparent UI elements
- 🔄 **Premium Features**: Additional features marked as "Coming Soon"
- 🔄 **Enhanced Analytics**: Advanced reporting and insights (planned)

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **React Router** for client-side routing
- **TanStack React Query** for server state management
- **shadcn/ui** for consistent UI components
- **Tailwind CSS** for styling with Aurora animations
- **Lucide React** for icons
- **Framer Motion** for smooth animations

### UI/UX Design System
- **Aurora Backgrounds**: Animated gradient backgrounds with flowing color transitions
- **Glassmorphism**: Semi-transparent cards with backdrop blur effects
- **shadcn/ui Components**: Modern, accessible UI component library
- **Tailwind CSS**: Utility-first CSS framework with custom animations
- **Framer Motion**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach with breakpoint optimization

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
  "tailwindcss": "^3.4.1",
  "framer-motion": "^12.23.12",
  "@elevenlabs/client": "Realtime voice interviews"
}
```

## 📊 Database Schema

### Core Tables

#### `company_profiles`
- **Purpose**: Company information and subscription management
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `user_id` (UUID, FK to auth.users, Unique)
  - `company_name`, `company_description` (TEXT)
  - `company_website`, `company_size`, `industry` (TEXT)
  - `address`, `phone`, `logo_url` (TEXT)
  - `subscription_plan` (TEXT, Default: 'free')
  - `jobs_posted_this_month` (INTEGER, Default: 0)
  - `last_job_count_reset` (TIMESTAMPTZ, Default: now())
  - `created_at` (TIMESTAMPTZ, Default: now())
  - `updated_at` (TIMESTAMPTZ, Default: now())

#### `jobs`
- **Purpose**: Job postings created by companies
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `company_profile_id` (UUID, FK to company_profiles)
  - `title`, `description`, `requirements`, `responsibilities`, `benefits` (TEXT)
  - `department` (TEXT, NOT NULL)
  - `company` (TEXT, NOT NULL)
  - `location` (TEXT)
  - `employment_type` (TEXT, Default: 'full-time')
  - `experience_level` (TEXT, Default: 'mid-level')
  - `status` (TEXT, Default: 'active')
  - `created_at` (TIMESTAMPTZ, Default: now())
  - `updated_at` (TIMESTAMPTZ, Default: now())

#### `applications`
- **Purpose**: Job applications with resume storage and processing
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `job_id` (UUID, FK to jobs)
  - `resume_url` (TEXT, URL to stored resume file)
  - `resume_text` (TEXT, Extracted text content from resume)
  - `status` (TEXT, Default: 'pending')
  - `original_filename` (TEXT, Original resume filename)
  - `uploaded_by_user_id` (UUID, FK to auth.users)
  - `created_at` (TIMESTAMPTZ, Default: now())
  - `updated_at` (TIMESTAMPTZ, Default: now())
- **Indexes**:
  - `idx_applications_job_id` (BTREE on job_id)
  - `idx_applications_resume_text` (GIN on resume_text for full-text search)
  - `idx_applications_uploaded_by_user_id` (BTREE on uploaded_by_user_id)
  - `idx_applications_original_filename` (BTREE on original_filename)

#### `resume_pool`
- **Purpose**: Centralized resume storage pool for companies to manage their resume collection
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `company_profile_id` (UUID, FK to company_profiles, NOT NULL)
  - `original_filename` (TEXT, NOT NULL, Original resume filename)
  - `storage_path` (TEXT, NOT NULL, Path to stored resume file in Supabase storage)
  - `file_size` (INTEGER, NOT NULL, File size in bytes)
  - `uploaded_by_user_id` (UUID, FK to auth.users, NOT NULL)
  - `resume_text` (TEXT, NULL, Extracted text content from resume for AI processing)
  - `created_at` (TIMESTAMPTZ, NOT NULL, Default: now())
  - `updated_at` (TIMESTAMPTZ, NOT NULL, Default: now())
- **Constraints**:
  - `resume_pool_pkey` (Primary Key on id)
  - `resume_pool_company_profile_id_fkey` (Foreign Key to company_profiles with CASCADE delete)
  - `resume_pool_uploaded_by_user_id_fkey` (Foreign Key to auth.users with CASCADE delete)
- **Indexes**:
  - `idx_resume_pool_company_profile_id` (BTREE on company_profile_id)
  - `idx_resume_pool_uploaded_by_user_id` (BTREE on uploaded_by_user_id)
  - `idx_resume_pool_original_filename` (BTREE on original_filename)
  - `idx_resume_pool_resume_text` (GIN on resume_text for full-text search)
- **Triggers**:
  - `trigger_update_resume_pool_updated_at` (Updates updated_at timestamp on row updates)

#### `screening_results`
- **Purpose**: AI-powered candidate screening and evaluation results
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `job_id` (UUID, FK to jobs)
  - `application_id` (UUID, FK to applications)
  - `first_name`, `last_name` (TEXT, NOT NULL)
  - `email` (TEXT, NOT NULL)
  - `phone`, `home_address` (TEXT)
  - `resume_url`, `resume_text` (TEXT)
  - `overall_fit` (INTEGER, 0-100 score)
  - `strengths`, `weaknesses`, `risk_factor`, `reward_factor` (TEXT)
  - `justification`, `notes` (TEXT)
  - `voice_screening_requested` (BOOLEAN, Default: false)
  - `voice_screening_completed` (BOOLEAN, Default: false)
  - `voice_screening_notes`, `interview_summary` (TEXT)
  - `interview_completed_at` (TIMESTAMPTZ)
  - `is_favorite`, `is_dismissed` (BOOLEAN, Default: false)
  - `date` (TIMESTAMPTZ, NOT NULL, Default: now())
  - `created_at` (TIMESTAMPTZ, NOT NULL, Default: now())
  - `updated_at` (TIMESTAMPTZ, NOT NULL, Default: now())

#### `job_collaborators`
- **Purpose**: Team collaboration for job postings and management
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `job_id` (UUID, FK to jobs)
  - `user_id` (UUID, FK to auth.users)
  - `invited_by` (UUID, FK to auth.users)
  - `role` (TEXT, Default: 'collaborator')
  - `created_at` (TIMESTAMPTZ, Default: now())
  - `updated_at` (TIMESTAMPTZ, Default: now())
- **Indexes**:
  - `idx_job_collaborators_job_id` (BTREE on job_id)
  - `idx_job_collaborators_user_id` (BTREE on user_id)

#### `job_invitations`
- **Purpose**: Email-based invitation system for job collaboration
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `job_id` (UUID, FK to jobs)
  - `invited_email` (TEXT)
  - `invited_by` (UUID, FK to auth.users)
  - `token` (TEXT, Default: gen_random_uuid()::text)
  - `status` (TEXT, Default: 'pending')
  - `expires_at` (TIMESTAMPTZ, Default: now() + '7 days'::interval)
  - `created_at` (TIMESTAMPTZ, Default: now())
  - `updated_at` (TIMESTAMPTZ, Default: now())

### Points & Payment System

#### `point_packages`
- **Purpose**: Available point packages for purchase
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `name` (TEXT)
  - `points` (INTEGER)
  - `price_cents` (INTEGER)
  - `is_active` (BOOLEAN, Default: true)
  - `created_at` (TIMESTAMPTZ, Default: now())

#### `point_transactions`
- **Purpose**: Points transaction history and tracking
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `user_id` (UUID, FK to auth.users)
  - `points` (INTEGER, positive for earned, negative for spent)
  - `transaction_type` (TEXT)
  - `description` (TEXT)
  - `reference_id` (UUID, FK to related records)
  - `created_at` (TIMESTAMPTZ, Default: now())

#### `user_points`
- **Purpose**: Current points balance for each user
- **Fields**:
  - `id` (UUID, Primary Key, Default: gen_random_uuid())
  - `user_id` (UUID, FK to auth.users, Unique)
  - `points_balance` (INTEGER, Default: 0)
  - `created_at` (TIMESTAMPTZ, Default: now())
  - `updated_at` (TIMESTAMPTZ, Default: now())

### AI & RAG System

#### `documents`
- **Purpose**: Vector storage for RAG (Retrieval-Augmented Generation) functionality
- **Fields**:
  - `id` (BIGINT, Primary Key, Default: nextval('documents_id_seq'::regclass))
  - `content` (TEXT)
  - `metadata` (JSONB)
  - `embedding` (VECTOR, User-defined type for AI embeddings)

### Storage Buckets
- **`company_uploads`**: Private bucket for storing company-uploaded resumes and job application resumes (PDF files)

### Key Features
- **Full-text Search**: Applications table includes GIN index on `resume_text` for efficient text searching
- **Vector Search**: Documents table supports AI-powered semantic search with embeddings
- **Subscription Management**: Company profiles track subscription plans and monthly job posting limits
- **Team Collaboration**: Job collaborators and invitations enable multi-user access to specific job postings
- **Points System**: Complete points-based payment and transaction tracking system
- **AI Screening**: Comprehensive screening results with voice interview capabilities
- **Resume Processing**: Applications store both file URLs and extracted text content for AI processing

## 🔐 Authentication System

### Authentication Flow
1. **User Registration**: Users sign up with email/password and select user type
2. **Email Verification**: Supabase sends confirmation email
3. **Profile Creation**: Automatic profile creation with user type
4. **Company Setup**: Companies complete additional profile information
5. **Session Management**: Persistent sessions with automatic refresh

### User Types
- **`company`**: Can post jobs, manage applications, and conduct AI screening
- **`recruiter`**: Can collaborate on job postings and manage candidate evaluations

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
  loading: boolean;
  signUp: (email: string, password: string, companyData: CompanyData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  isEmailVerified: boolean;
}
```

## 🔧 Environment Variables

### Environment Configuration
The application uses environment variables stored in a local env file (recommended: `.env.local` for development):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://bwuomwyodoyyrqgdlwrp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Screening Webhook (optional)
VITE_SCREENING_WEBHOOK_URL=https://n8n.cognitechx.com/webhook-test/Hirios

# Resume Pool Webhook (optional)
VITE_WEBHOOK_RESUME_POOL_URL=https://n8n.cognitechx.com/

# Voice Interview (ElevenLabs)
VITE_ELEVENLABS_KEY=your_11labs_api_key
VITE_AGENT_ID=your_agent_id

# Application Configuration
VITE_APP_NAME=Hirios
VITE_APP_DESCRIPTION=Job Portal Application
```

### Required Environment Variables
- **`VITE_SUPABASE_URL`**: Your Supabase project URL
- **`VITE_SUPABASE_ANON_KEY`**: Your Supabase anonymous key
- **`VITE_SCREENING_WEBHOOK_URL`**: Optional: webhook endpoint for screening events
- **`VITE_WEBHOOK_RESUME_POOL_URL`**: Optional: webhook endpoint for resume pool processing
- **`VITE_ELEVENLABS_KEY`**: ElevenLabs API key for voice interviews
- **`VITE_AGENT_ID`**: ElevenLabs Agent ID used for interviews
- **`VITE_APP_NAME`**: Application name (optional)
- **`VITE_APP_DESCRIPTION`**: Application description (optional)

### Environment Setup for Development
1. Create a `.env.local` file in the project root
2. Add and update the variables shown above with your actual configuration:
   - Replace `your_supabase_project_url` with your Supabase project URL
   - Replace `your_supabase_anon_key` with your Supabase anonymous key
   - Optionally set `VITE_SCREENING_WEBHOOK_URL` to your webhook URL
   - Set `VITE_ELEVENLABS_KEY` and `VITE_AGENT_ID` for voice interviews
3. The application reads `VITE_`-prefixed variables at build time

**Note**: All environment variables must be prefixed with `VITE_` to be accessible in the frontend application.

## 🗂️ Project Structure

```
Hirios/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── aurora-background.tsx # Aurora animated background
│   │   │   └── [other ui components]
│   │   ├── ApplicationCard.tsx
│   │   ├── CompanyView.tsx   # Company dashboard
│   │   ├── UserView.tsx      # Job seeker interface
│   │   ├── JobApplicationsView.tsx
│   │   ├── ScreeningResultCard.tsx
│   │   ├── ScreeningResultActions.tsx
│   │   └── ResumePoolUpload.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx   # Authentication state
│   ├── hooks/               # Custom React hooks
│   │   ├── useJobs.ts       # Job management
│   │   ├── useApplications.ts # Application management
│   │   ├── useCompanyJobs.ts # Company-specific jobs
│   │   ├── useScreeningResults.ts
│   │   ├── useApplicationProcessing.ts
│   │   └── useResumePool.ts  # Resume pool management
│   ├── integrations/        # External service integrations
│   │   └── supabase/        # Supabase client and types
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   │   ├── HiriosLanding.tsx # Marketing landing page (/)
│   │   ├── Index.tsx         # Legacy job portal (kept as /job-portal-old)
│   │   ├── Auth.tsx          # Authentication page with Aurora background
│   │   ├── AuthConfirm.tsx   # Email confirmation handler
│   │   ├── ResetPassword.tsx # Password reset flow
│   │   ├── JobPortal.tsx     # Main application dashboard
│   │   ├── CompanySetup.tsx  # Company onboarding
│   │   ├── ScreeningResults.tsx # AI screening dashboard
│   │   ├── ScreeningResultDetail.tsx # Detailed screening view
│   │   ├── VoiceInterview.tsx   # AI voice interview page
│   │   ├── ResumePool.tsx       # Resume pool management page
│   │   └── NotFound.tsx      # 404 fallback
│   ├── services/            # External API services
│   │   ├── voiceInterviewService.ts # ElevenLabs + data aggregation
│   │   ├── proxyService.ts
│   │   └── webhookService.ts
│   └── main.tsx             # Application entry point
├── supabase/
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase configuration
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind with Aurora animations
└── vite.config.ts          # Vite configuration
```

## 🧭 Routes

Defined in `src/App.tsx` using React Router:

- `/` → `HiriosLanding` (marketing landing page)
- `/auth` → `Auth` (company/recruiter sign in/up)
- `/auth/confirm` → `AuthConfirm`
- `/auth/reset-password` → `ResetPassword`
- `/job-portal` → `JobPortal` (company dashboard)
- `/company-setup` → `CompanySetup`
- `/screening-results` → `ScreeningResults` (AI screening dashboard)
- `/interview/:screeningResultId/:applicationId` → `VoiceInterview`
- `/points-purchase` → `PointsPurchase`
- `/points-history` → `PointsHistory`
- `/resume-pool` → `ResumePool` (centralized resume management)
- `/invite-accept` → `InviteAccept` (collaboration invitations)
- `*` → `NotFound`

## 🔄 Data Flow

### Job Posting Flow (Company)
1. Company signs up and completes profile setup with subscription plan
2. Company creates job posting through `CompanyView`
3. Job data saved to `jobs` table with `company_profile_id`
4. Monthly job posting counter tracked in `company_profiles`
5. Real-time updates via React Query invalidation

### Job Application Flow (External Candidates)
1. External candidates apply through company job postings
2. Resume uploaded to Supabase Storage with text extraction
3. Application data saved to `applications` table with:
   - Resume URL and extracted text content
   - Original filename and uploader tracking
   - Status set to 'pending'
4. Optional webhook triggered to external processing system
5. AI screening results stored in `screening_results` with:
   - Comprehensive candidate evaluation
   - Voice screening capabilities
   - Interview tracking and notes

### Voice Interview Flow
1. From `ScreeningResults`, a company can request a voice interview (sends webhook and marks record)
2. A direct link can be generated/copied to invite the candidate
3. On visit, `VoiceInterview` loads candidate/job data and starts a realtime AI conversation (with mic permission)

### Team Collaboration Flow
1. Company user invites collaborators via email to specific job postings
2. Invitation data stored in `job_invitations` table with:
   - Unique token for secure access
   - 7-day expiration by default
   - Status tracking (pending, accepted, expired)
3. Collaborators receive email invitations to join the hiring team
4. Upon acceptance, collaborators gain access to specific job postings
5. Access control managed through `job_collaborators` table with role assignment
6. All team members can view and manage applications for their assigned jobs
7. Real-time collaboration updates via React Query invalidation

### Points & Payment Flow
1. Users can purchase point packages from `point_packages`
2. Point transactions recorded in `point_transactions` with:
   - Transaction type and description
   - Reference to related actions (job posting, screening, etc.)
   - Positive points for purchases, negative for usage
3. User balance updated in `user_points` table
4. Points can be spent on premium features like:
   - Additional job postings
   - AI screening services
   - Voice interview features

### Resume Pool Flow
1. Company users upload resumes to centralized pool via `/resume-pool` route
2. Resumes stored in `company_uploads` storage bucket with organized folder structure
3. Resume metadata saved to `resume_pool` table with:
   - Company association and uploader tracking
   - File size and storage path information
   - Original filename preservation
4. AI processing triggered via webhook for text extraction and analysis
5. Extracted text content stored for full-text search capabilities
6. Company can manage, search, download, and delete resumes from their pool
7. Real-time updates via React Query for seamless user experience

### RAG & AI Processing Flow
1. Documents uploaded and processed for AI analysis
2. Content and metadata stored in `documents` table
3. AI embeddings generated and stored in `embedding` field
4. Vector search enables semantic document retrieval
5. RAG integration enhances AI responses with relevant context

### Authentication Flow
1. Company/recruiter registration/login via Supabase Auth
2. Company profile creation with subscription plan and monthly limits
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
   - Experience the beautiful Aurora backgrounds and modern UI design

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
- ⚠️ Some endpoints/data may have relaxed policies for demo purposes

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

This project is part of the modern AI-powered development ecosystem.

## 🔗 External Integrations

### Webhook Service
- **Purpose**: Send application data to external processing systems
- **Env Var**: `VITE_SCREENING_WEBHOOK_URL`
- **Example**: `https://n8n.cognitechx.com/webhook-test/Hirios`
- **Data**: Screening metadata (candidate, job, link) where applicable

### Resume Pool Webhook Service
- **Purpose**: Send resume pool data to external AI processing systems
- **Env Var**: `VITE_WEBHOOK_RESUME_POOL_URL`
- **Example**: `https://n8n.cognitechx.com/`
- **Data**: Resume pool metadata (resume_id, filename, base64 content, company_id) for AI processing

### ElevenLabs Realtime
- **Purpose**: Run AI-powered voice interviews
- **Env Vars**: `VITE_ELEVENLABS_KEY`, `VITE_AGENT_ID`
- **Client**: `@elevenlabs/client` via `voiceInterviewService.ts`

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
