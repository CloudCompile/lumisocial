# Lumi - Social Media Platform

A modern, full-stack social media application built with React, Express, Supabase, and Vercel.

## Features

- 🔐 User authentication with email/password
- 📸 Upload photos (via Pollinations API) and videos (via Cloudinary)
- ❤️ Like and unlike posts with heart animations
- 💬 Comment on posts
- 👥 Follow/unfollow users
- 👤 User profiles with bio and avatar
- 🏠 Home feed (posts from followed users)
- 🔍 Explore feed (all posts)
- 📱 Fully responsive mobile-first design
- 🌙 Dark mode by default with accent colors

## Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Supabase JS Client
- Axios

**Backend:**
- Node.js
- Express.js
- Supabase (Auth, Database, RLS)

**External Services:**
- Pollinations API (Image uploads)
- Cloudinary (Video uploads)
- Supabase (Database & Authentication)
- Vercel (Deployment)

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd lumisocial
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, paste the contents of `/supabase/schema.sql`
3. Run the SQL to create tables and RLS policies
4. Copy your project URL and anon key from the API settings

### 3. Set Up External Services

#### Pollinations API
- Get your API key from [pollinations.ai](https://pollinations.ai)

#### Cloudinary
- Create a free account at [cloudinary.com](https://cloudinary.com)
- Create an unsigned upload preset for video uploads
- Copy your cloud name and upload preset

### 4. Environment Variables

Create a `.env.local` file in both `client/` and `server/` directories:

**`client/.env.local`:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POLLINATIONS_API_KEY=your_pollinations_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

**`server/.env.local`:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SERVER_PORT=5000
NODE_ENV=development
```

### 5. Install Dependencies

```bash
npm install
```

This installs dependencies for both `client/` and `server/` workspaces.

### 6. Run Development Server

```bash
npm run dev
```

This starts:
- Frontend at `http://localhost:3000`
- Backend at `http://localhost:5000`

### Individual Development

Run only frontend:
```bash
npm run client
```

Run only backend:
```bash
npm run server
```

## Database Schema

### Users Table
- `id` (uuid, primary key)
- `email` (text, unique)
- `username` (text, unique)
- `avatar_url` (text)
- `bio` (text)
- `created_at` (timestamp)

### Posts Table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `media_url` (text)
- `media_type` (enum: 'image', 'video')
- `caption` (text)
- `created_at` (timestamp)

### Likes Table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `post_id` (uuid, foreign key)
- `created_at` (timestamp)
- Unique constraint on (user_id, post_id)

### Comments Table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `post_id` (uuid, foreign key)
- `content` (text)
- `created_at` (timestamp)

### Follows Table
- `follower_id` (uuid, foreign key)
- `following_id` (uuid, foreign key)
- `created_at` (timestamp)
- Primary key on (follower_id, following_id)

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts/feed` - Get home feed (followed users)
- `GET /api/posts/explore` - Get explore feed (all posts)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete own post

### Likes
- `POST /api/likes` - Like a post
- `DELETE /api/likes/:post_id` - Unlike a post
- `GET /api/likes/post/:post_id` - Get likes for a post

### Comments
- `GET /api/comments/post/:post_id` - Get comments for a post
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Follows
- `POST /api/follows` - Follow user
- `DELETE /api/follows/:following_id` - Unfollow user
- `GET /api/follows/:user_id/followers` - Get followers
- `GET /api/follows/:user_id/following` - Get following
- `GET /api/follows/:user_id/is-following/:target_id` - Check follow status

### Users
- `GET /api/users/:username` - Get user profile
- `GET /api/users` - Get current user
- `PUT /api/users` - Update own profile
- `GET /api/users/:user_id/posts` - Get user's posts

## Deployment to Vercel

### Frontend Setup
1. Push code to GitHub
2. In Vercel dashboard, create new project from repository
3. Set root directory to `client/`
4. Add environment variables from `.env.local`
5. Deploy

### Backend Setup
1. Create a new Vercel project for the server
2. Set root directory to `server/`
3. Add environment variables
4. Deploy

### Complete Full-Stack Deployment
For a fully integrated deployment, use the included `vercel.json` configuration which handles both frontend and backend together.

## Building for Production

```bash
npm run build
```

This builds both frontend and backend for production.

## Project Structure

```
lumisocial/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   ├── lib/         # Utilities (API, Supabase)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Auth, error handling
│   │   └── index.js    # Express app
│   └── package.json
├── supabase/
│   └── schema.sql      # Database schema
├── vercel.json         # Vercel deployment config
├── .env.example        # Environment variables template
├── package.json        # Root workspace
└── README.md          # This file
```

## Contributing

This is a demo application. Feel free to fork and customize!

## License

MIT
