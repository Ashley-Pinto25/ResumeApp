# CareerLift - AI-Powered Resume Analysis

CareerLift is a modern web application that allows users to upload their resumes in PDF format and receive detailed AI-powered analysis and feedback.

## Features

- 🔐 **Secure Authentication**: User accounts and data protection
- 📄 **PDF Resume Upload**: Upload resumes with drag-and-drop support
- 🤖 **AI Analysis**: Smart analysis of resume content and structure
- 📊 **Detailed Feedback**: Get insights on strengths, weaknesses, and improvement suggestions
- 🎯 **Scoring System**: Receive an overall score for your resume
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## Technology Stack

- React with TypeScript
- Tailwind CSS with DaisyUI
- Firebase
- Google AI
- **File Storage**: Google Drive API
- **Database**: Firestore
- **AI**: Google Gemini AI
- **PDF Processing**: PDF.js
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Firebase account
- Google AI Studio account for Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CareerLift
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Enable Firestore Database
4. Enable Storage
5. Add your domain to authorized domains in Authentication settings
6. Create security rules for Firestore and Storage

### Gemini AI Setup

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the API key to your `.env` file

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthForm.tsx    # Authentication form
│   ├── Dashboard.tsx   # Main dashboard
│   ├── ResumeUpload.tsx # Resume upload component
│   └── ResumeList.tsx  # Resume list and analysis viewer
├── services/           # External service integrations
│   ├── authService.ts  # Firebase Auth service
│   ├── resumeService.ts # Resume CRUD operations
│   └── geminiService.ts # Gemini AI integration
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── types/              # TypeScript type definitions
│   └── index.ts       # App-wide types
├── utils/              # Utility functions
│   └── pdfUtils.ts    # PDF processing utilities
├── config/             # Configuration files
│   └── firebase.ts    # Firebase configuration
└── App.tsx            # Main app component
```

## Features in Detail

### Authentication
- Email/password registration and login
- Password reset functionality
- Protected routes and session management

### Resume Upload
- Drag-and-drop PDF upload
- File validation (PDF only, max 10MB)
- Real-time upload progress
- Automatic text extraction from PDF

### AI Analysis
- Comprehensive resume analysis using Gemini AI
- Identifies strengths and weaknesses
- Suggests missing sections
- Provides improvement recommendations
- Assigns an overall score (1-100)

### Dashboard
- View all uploaded resumes
- Access detailed analysis reports
- Download original files
- Delete resumes
- Responsive design for all devices

## Security

- All user data is secured with Firebase Authentication
- Firestore security rules ensure users can only access their own data
- File uploads are validated and stored securely in Firebase Storage
- Environment variables protect sensitive API keys

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact [your-email@example.com] or create an issue in the GitHub repository.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
