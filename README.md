# Smart Ride Sharing Platform

![Smart Ride Sharing](https://via.placeholder.com/800x400?text=Smart+Ride+Sharing)

A modern, full-stack ride-sharing application that connects drivers with passengers for efficient carpooling and ride-sharing experiences.

## 🚀 Features

- **User Authentication and Verification**
  - Secure signup/login with email
  - Document verification (PAN Card, Aadhar)
  - Profile management

- **Ride Management**
  - Offer rides with detailed preferences
  - Find available rides
  - Real-time ride matching based on location
  - Ride booking and confirmation workflow

- **Advanced Booking System**
  - Request/approve ride bookings
  - Booking status tracking (Pending, Confirmed, Rejected, Cancelled)
  - Passenger/driver communication

- **Vehicle Management**
  - Add and manage multiple vehicles
  - Vehicle details (model, color, license plate)

- **Preferences and Filtering**
  - Ride preferences (smoking, pets, quiet rides)
  - Search radius customization
  - Filter rides by various criteria

- **User Profiles and Ratings**
  - Driver/passenger ratings
  - User verification badges
  - Profile customization

- **Eco Impact Tracking**
  - CO2 savings calculation
  - Gamification and rewards

## 💻 Technologies Used

### Frontend
- **Next.js** - React framework with server-side rendering
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State and lifecycle management
- **Fetch API** - Data fetching
- **date-fns** - Date manipulation

### Backend
- **Express.js** - Web server framework
- **Prisma** - ORM for database operations
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Node.js** - JavaScript runtime
- **AWS SDK** - File storage for user documents
- **Multer** - File upload handling
- **Nodemailer** - Email notifications

### Deployment
- **Vercel** - Frontend and serverless backend hosting

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Clone the repository
```bash
git clone https://github.com/yourusername/smart-ride-sharing.git
cd smart-ride-sharing

### Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup
1. Create `.env` files in both frontend and backend directories:

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Backend (.env):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smart_ride_sharing"
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

2. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001



