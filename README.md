# DHAPP Frontend

This is the frontend application for DHAPP, a travel and driver booking platform built with React, Vite, Material-UI, and Redux Toolkit.

## Features

- User authentication (login/signup with email/password and Google OAuth)
- Dashboard for users
- Book drivers and travel services
- Responsive UI with Material-UI components

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Authentication:** JWT, Google OAuth

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Backend server running on `http://127.0.0.1:8000` (Python backend assumed)
- Git

## Full Setup Process

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DHAPP-FRONTEND
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### Getting Google OAuth Client ID:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create credentials (OAuth 2.0 Client ID)
5. Set authorized redirect URIs (e.g., `http://localhost:5173` for development)
6. Copy the Client ID to the `.env` file

**Note:** Replace `your_google_client_id_here` with your actual Google Client ID.

### 4. Backend Setup

This frontend requires a backend server. The backend should be a Python application (likely FastAPI or Django) that provides the following endpoints:

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration  
- `POST /auth/google` - Google OAuth login
- `GET /drivers/` - Fetch available drivers

**Backend Setup Steps:**
1. Clone the backend repository (DHAPP-BACKEND)
2. Follow the backend's README for setup instructions
3. Ensure the backend runs on `http://127.0.0.1:8000`
4. Start the backend server

### 5. Start the Development Server

Ensure the backend is running on port 8000, then start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 6. Build for Production

```bash
npm run build
```

### 7. Preview Production Build

```bash
npm run preview
```

### 8. Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── app/
│   └── store.js          # Redux store configuration
├── components/
│   ├── Footer.jsx        # Footer component
│   └── Navbar.jsx        # Navigation bar
├── features/
│   ├── authSlice.js      # Authentication state management
│   └── driverSlice.js    # Driver data state management
├── pages/
│   ├── BookDriver.jsx    # Driver booking page
│   ├── BookTravel.jsx    # Travel booking page
│   ├── Dashboard.jsx     # User dashboard
│   └── Login.jsx         # Login/Signup page
├── App.css               # App styles
├── App.jsx               # Main App component
├── index.css             # Global styles
└── main.jsx              # App entry point
```

## API Endpoints

The frontend communicates with the backend at the configured `VITE_API_BASE_URL`:

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/google` - Google OAuth login
- `GET /drivers/` - Fetch available drivers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Test your changes
6. Submit a pull request

## License

This project is licensed under the MIT License.
