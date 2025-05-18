# Training Registration System - Next.js Frontend

This guide will walk you through setting up the Next.js frontend application for the Training Registration System to connect with your FastAPI backend.

## Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- FastAPI backend running on http://localhost:8000

## Step 1: Project Setup

Run the setup script to create the project structure:

```bash
chmod +x setup-project.sh
./setup-project.sh
```

This will create all required files and folders for the application.

## Step 2: Install Dependencies

Navigate to the project directory and install dependencies:

```bash
cd training-registration-system
npm install
```

## Step 3: Configure API Connection

The application is configured to connect to the FastAPI backend at `http://localhost:8000`. If your backend is running on a different URL, adjust the `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://your-backend-url
```

## Step 4: Start Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Step 5: Login

Use the default credentials to log in:

- Admin user: `admin` / `adminpassword`
- Regular user: `user` / `userpassword`

## Project Structure

The frontend follows a modular architecture:

- `app/` - Next.js app router pages
- `components/` - React components organized by feature
- `lib/` - Utility functions and API client
- `public/` - Static assets

## Key Features

1. **Dashboard**
   - Visual overview of training statistics
   - Charts and graphs for data visualization
   - Status cards for quick information

2. **Training Registrations**
   - List all registrations with filtering and sorting
   - Create new registration requests
   - Confirm and manage registrations

3. **Trainers, Customers, and Courses Management**
   - CRUD operations for all entities
   - Detailed information views
   - Relationship management

4. **User Authentication**
   - Secure login with JWT tokens
   - Role-based access control
   - Protected routes

## UI Components

The UI is built using Shadcn UI, which provides a consistent design system based on Radix UI and styled with Tailwind CSS. The components match the IoT dashboard example provided in the requirements, with adaptations for the training registration system.

## Customization

You can customize the appearance by modifying:

- `tailwind.config.js` - To change colors, spacing, and other design tokens
- `globals.css` - To adjust global styles and variables

## Production Build

To create a production build:

```bash
npm run build
npm start
```

## Connecting to the Backend

The application connects to your FastAPI backend through the API client in `lib/api.ts`. All API calls are authenticated with JWT tokens stored in localStorage.

## Troubleshooting

- If you encounter CORS issues, make sure your FastAPI backend has CORS properly configured
- If authentication fails, check the token endpoint in your FastAPI application
- For UI issues, verify your Tailwind CSS configuration

## Next Steps

After installation, consider:

1. Customizing the dashboard to show real-time data from your backend
2. Adding more detailed reports and analytics
3. Implementing additional features like notifications or calendar integrations