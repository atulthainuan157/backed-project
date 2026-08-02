# 🎬 VideoTube — Backend API

A production-grade backend for a **YouTube-like video hosting platform**, built with **Node.js**, **Express**, and **MongoDB**. It handles user authentication, video management, subscriptions, playlists, comments, likes, and tweets — everything needed to power a modern video-sharing application.

> **📐 Data Model Diagram:** [View on Eraser](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

---

## 📖 Table of Contents

- [What Does This Project Do?](#-what-does-this-project-do)
- [Tech Stack — Why Each Technology?](#-tech-stack--why-each-technology)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [How It All Connects](#-how-it-all-connects)
- [Author](#-author)

---

## 🎯 What Does This Project Do?

Think of it as the **engine behind a video-sharing website** like YouTube. While there's no visible website here (no frontend), this project provides all the behind-the-scenes logic that a frontend app would talk to:

| Feature | What It Does |
|---|---|
| **User Registration & Login** | Users can sign up with a username, email, password, avatar, and cover image |
| **Secure Authentication** | Passwords are encrypted; login sessions use industry-standard JWT tokens |
| **File Uploads** | Profile pictures and cover images are uploaded to Cloudinary (a cloud image service) |
| **Channel Profiles** | Each user is a "channel" — you can view their subscriber count and subscription info |
| **Subscriptions** | Users can subscribe to other channels, just like YouTube |
| **Videos** | Videos can be uploaded with titles, descriptions, thumbnails, and view tracking |
| **Playlists** | Users can create playlists and add videos to them |
| **Comments** | Users can comment on videos |
| **Likes** | Users can like videos, comments, and tweets |
| **Tweets** | A community-post-like feature for short text updates |
| **Watch History** | Tracks which videos a user has watched |

---

## 🛠 Tech Stack — Why Each Technology?

### For Non-Technical Readers

| Technology | What Is It? | Why We Use It |
|---|---|---|
| **Node.js** | A program that lets JavaScript run on a server (not just in a browser) | It's fast, widely used, and has a huge community |
| **Express** | A framework that makes building web servers easier in Node.js | Simplifies routing, middleware, and request handling |
| **MongoDB** | A database that stores data as flexible, JSON-like documents | Perfect for media apps where data shapes can vary (videos, users, playlists) |
| **Mongoose** | A tool that defines the "shape" of data in MongoDB | Adds validation, relationships, and structure to our database |
| **Cloudinary** | A cloud service for storing and managing images/videos | Handles image optimization, transformations, and CDN delivery |
| **JWT (JSON Web Tokens)** | A secure way to verify user identity | Enables stateless, secure login sessions |
| **bcrypt** | A password hashing library | Encrypts passwords so they're never stored as plain text |
| **Multer** | A file upload handler | Temporarily stores uploaded files before sending to Cloudinary |

### For Technical Readers

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | Web framework with v5 router and async error handling |
| `mongoose` | ^9.7.4 | MongoDB ODM with schema validation, middleware hooks, and aggregation pipelines |
| `mongoose-aggregate-paginate-v2` | ^1.1.4 | Pagination plugin for MongoDB aggregation queries |
| `bcrypt` | ^6.0.0 | Password hashing with configurable salt rounds (10 rounds) |
| `jsonwebtoken` | ^9.0.3 | JWT-based access & refresh token authentication |
| `cloudinary` | ^2.10.0 | Cloud media storage with auto resource-type detection |
| `multer` | ^2.2.0 | `multipart/form-data` file upload handling with disk storage |
| `cookie-parser` | ^1.4.7 | Parse HTTP cookies for token-based auth |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing configuration |
| `dotenv` | ^17.4.2 | Environment variable management |
| `nodemon` | ^3.1.14 | _(dev)_ Auto-restart server on file changes |
| `prettier` | ^3.9.5 | _(dev)_ Code formatting consistency |

**Module System:** ES Modules (`"type": "module"` in package.json)

---

## 📁 Project Structure

```
backed-project/
│
├── public/
│   └── temp/                    # Temporary file storage for uploads
│
├── src/
│   ├── index.js                 # 🚀 Entry point — starts server & connects to DB
│   ├── app.js                   # Express app setup (CORS, JSON parsing, cookies, routes)
│   ├── constants.js             # App-wide constants (DB name)
│   │
│   ├── db/
│   │   └── index.js             # MongoDB connection logic using Mongoose
│   │
│   ├── models/                  # 📦 Data schemas — define what data looks like in the DB
│   │   ├── user.model.js        # User schema (with password hashing & JWT generation)
│   │   ├── video.model.js       # Video schema (with aggregate pagination)
│   │   ├── comment.model.js     # Comment schema (linked to videos & users)
│   │   ├── like.model.js        # Like schema (polymorphic — videos, comments, tweets)
│   │   ├── playlist.model.js    # Playlist schema (name, description, video list)
│   │   ├── subscription.model.js# Subscription schema (subscriber ↔ channel)
│   │   └── tweet.model.js       # Tweet/community post schema
│   │
│   ├── controllers/             # 🧠 Business logic — what happens when an API is called
│   │   └── user.controller.js   # All user-related operations (register, login, profile, etc.)
│   │
│   ├── routes/                  # 🛤 URL definitions — maps URLs to controller functions
│   │   └── user.route.js        # User API routes (/api/v1/users/...)
│   │
│   ├── middleware/              # 🔒 Request interceptors — run before controller logic
│   │   ├── auth.middleware.js   # JWT verification — protects secured routes
│   │   └── multer.middleware.js # File upload configuration
│   │
│   └── utils/                   # 🧰 Reusable helper tools
│       ├── ApiError.js          # Custom error class with HTTP status codes
│       ├── ApiResponse.js       # Standardized API response format
│       ├── asyncHandler.js      # Wrapper to catch async errors in Express
│       └── cloudinary.js        # Cloudinary upload logic with local file cleanup
│
├── .env                         # 🔐 Secret configuration (never committed to Git)
├── .env.sample                  # Template showing required environment variables
├── .gitignore                   # Files/folders excluded from Git
├── .prettierrc                  # Code formatting rules
├── .prettierignore              # Files excluded from Prettier formatting
├── package.json                 # Project metadata, scripts, and dependencies
└── README.md                    # 📄 You are here!
```

---

## 📦 Data Models

Below is how the data is structured in the database. Each box represents a **collection** (like a table) in MongoDB.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │    Video     │     │   Comment    │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ username     │◄────│ owner        │     │ content      │
│ email        │     │ videoFile    │◄────│ Video        │
│ fullname     │     │ thumbnail    │     │ owner        │──► User
│ avatar       │     │ title        │     └──────────────┘
│ coverImage   │     │ description  │
│ watchHistory │──►  │ duration     │     ┌──────────────┐
│ password     │     │ views        │     │    Like      │
│ refreshToken │     │ isPublished  │     ├──────────────┤
└─────────────┘     └──────────────┘     │ video        │──► Video
       │                                  │ comment      │──► Comment
       │            ┌──────────────┐     │ tweet        │──► Tweet
       │            │ Subscription │     │ likedBy      │──► User
       │            ├──────────────┤     └──────────────┘
       ├────────────│ subscriber   │
       └────────────│ channel      │     ┌──────────────┐
                    └──────────────┘     │   Playlist   │
                                         ├──────────────┤
       ┌──────────────┐                  │ name         │
       │    Tweet      │                  │ description  │
       ├──────────────┤                  │ videos       │──► [Video]
       │ content       │                  │ owner        │──► User
       │ owner         │──► User         └──────────────┘
       └──────────────┘
```

### Key Relationships

- A **User** can upload many **Videos** and has a **watch history**
- A **User** can subscribe to another **User** (Subscriber ↔ Channel)
- **Comments** belong to a **Video** and a **User**
- **Likes** are polymorphic — they can reference a **Video**, **Comment**, or **Tweet**
- **Playlists** contain multiple **Videos** and belong to a **User**

---

## 🔌 API Endpoints

All routes are prefixed with `/api/v1/users`

### 🔓 Public Routes (No login required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users/register` | Register a new user (with avatar & cover image upload) |
| `POST` | `/api/v1/users/login` | Login with username/email & password |
| `POST` | `/api/v1/users/refresh-token` | Get a new access token using refresh token |

### 🔐 Protected Routes (Login required — JWT token needed)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users/logout` | Logout & clear session cookies |
| `POST` | `/api/v1/users/change-password` | Change the current password |
| `GET` | `/api/v1/users/current-user` | Get the logged-in user's profile |
| `PATCH` | `/api/v1/users/update-account` | Update fullname & email |
| `PATCH` | `/api/v1/users/avatar` | Upload a new avatar image |
| `PATCH` | `/api/v1/users/cover-image` | Upload a new cover image |
| `GET` | `/api/v1/users/c/:username` | View a channel's public profile (with subscriber counts) |
| `GET` | `/api/v1/users/history` | Get the user's watch history |

---

## 🔐 Authentication Flow

This project uses a **dual-token system** for secure authentication:

```
  ┌────────────────────────────────────────────────────────────┐
  │                    AUTHENTICATION FLOW                      │
  └────────────────────────────────────────────────────────────┘

  1. User sends username/email + password
              │
              ▼
  2. Server verifies credentials against the database
     (password is compared using bcrypt)
              │
              ▼
  3. Server generates TWO tokens:
     ┌─────────────────────┐    ┌─────────────────────┐
     │   Access Token       │    │   Refresh Token      │
     │   (short-lived)      │    │   (long-lived)       │
     │   Contains: user ID, │    │   Contains: user ID  │
     │   email, username    │    │   Stored in DB +     │
     │                      │    │   sent as cookie     │
     └─────────────────────┘    └─────────────────────┘
              │
              ▼
  4. Both tokens sent to user as HTTP-only secure cookies
              │
              ▼
  5. On each request, the Access Token is verified
     via the auth middleware (verifyJWT)
              │
              ▼
  6. When Access Token expires, the client uses the
     Refresh Token to get a new Access Token
     (without re-entering the password)
```

**Why two tokens?**
- The **Access Token** expires quickly (for security) — even if stolen, it won't work for long
- The **Refresh Token** lasts longer and is stored in the database — it can be revoked if compromised

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed on your computer:

| Tool | What For | Download |
|---|---|---|
| **Node.js** (v18+) | Run JavaScript on your machine | [nodejs.org](https://nodejs.org) |
| **MongoDB** | The database | [mongodb.com](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud DB) |
| **Cloudinary Account** | Store uploaded images | [cloudinary.com](https://cloudinary.com) (free tier available) |

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/atulthainuan157/backed-project.git
cd backed-project

# 2. Install dependencies
npm install

# 3. Create your environment file
#    Copy .env.sample and fill in your values (see section below)
cp .env.sample .env

# 4. Start the development server
npm run dev
```

If everything is set up correctly, you'll see:

```
MongoDB connected... DB_HOST: <your-db-host>
Server is running at port: 8000
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=8000
CORS_ORIGIN=*

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net

# Cloudinary (get these from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Tokens
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10d
```

### Where to Get These Values

| Variable | Where to Find It |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/atlas) → Create Cluster → Connect → Get Connection String |
| `CLOUDINARY_*` | [Cloudinary Dashboard](https://console.cloudinary.com/) → Dashboard → Account Details |
| `ACCESS_TOKEN_SECRET` | Any long random string (e.g., generate at [randomkeygen.com](https://randomkeygen.com/)) |
| `REFRESH_TOKEN_SECRET` | A different long random string |

---

## 🔄 How It All Connects

Here's the journey of a typical API request through the application:

```
  Client (Postman / Frontend App)
          │
          │  HTTP Request (e.g., POST /api/v1/users/register)
          ▼
  ┌─── Express App (app.js) ─────────────────────────────┐
  │                                                        │
  │  1. CORS check          → Is the origin allowed?       │
  │  2. JSON parsing         → Parse the request body      │
  │  3. Cookie parsing       → Read authentication cookies │
  │  4. Static file serving  → Serve public/ files         │
  │                                                        │
  └────────────────────┬───────────────────────────────────┘
                       │
                       ▼
  ┌─── Router (user.route.js) ────────────────────────────┐
  │                                                        │
  │  Match the URL to the right controller function        │
  │  Apply middleware (multer for uploads, JWT for auth)    │
  │                                                        │
  └────────────────────┬───────────────────────────────────┘
                       │
                       ▼
  ┌─── Middleware ─────────────────────────────────────────┐
  │                                                        │
  │  • multer.middleware.js  → Save uploaded files to disk  │
  │  • auth.middleware.js    → Verify JWT token from cookie │
  │                                                        │
  └────────────────────┬───────────────────────────────────┘
                       │
                       ▼
  ┌─── Controller (user.controller.js) ───────────────────┐
  │                                                        │
  │  Business logic:                                       │
  │  • Validate input                                      │
  │  • Upload files to Cloudinary                          │
  │  • Query/update the database                           │
  │  • Generate tokens                                     │
  │  • Send standardized response                          │
  │                                                        │
  └────────────────────┬───────────────────────────────────┘
                       │
                       ▼
  ┌─── Database (MongoDB via Mongoose) ───────────────────┐
  │                                                        │
  │  Store/retrieve data using defined schemas (models)    │
  │  Run aggregation pipelines for complex queries         │
  │                                                        │
  └────────────────────────────────────────────────────────┘
```

---

## 🧑‍💻 Author

**Atul Thainuan**

- GitHub: [@atulthainuan157](https://github.com/atulthainuan157)
- Repository: [backed-project](https://github.com/atulthainuan157/backed-project)

---

## 📄 License

This project is licensed under the **ISC License**.