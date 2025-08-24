# 🏠 Airbnb Clone

A modern, full-stack Airbnb clone built with React, Node.js, and MongoDB. This project replicates the core functionality of Airbnb including property listings, user authentication, booking system, and more.

## ✨ Features

### Frontend (React + JSX)
- **Modern UI/UX**: Built with Tailwind CSS for a beautiful, responsive design
- **Authentication**: User registration, login, and profile management
- **Property Listings**: Browse, search, and filter properties
- **Property Details**: View detailed property information with images and booking form
- **Responsive Design**: Mobile-first approach with mobile navigation
- **Real-time Search**: Search properties by location, dates, and guests
- **User Dashboard**: Manage properties, bookings, and profile
- **Booking Management**: Complete booking workflow with status management
- **Review System**: Multi-category rating interface with host responses
- **Messaging System**: Real-time chat interface with conversation management
- **Favorites**: Save and manage favorite properties

### Backend (Node.js + Express)
- **RESTful API**: Clean, well-structured API endpoints
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Input validation using express-validator
- **Security**: Helmet.js, CORS, rate limiting
- **File Upload**: Support for property images

### Advanced Features
- **Booking System**: Complete reservation management with date validation, guest tracking, and pricing
- **Review System**: Multi-category ratings (cleanliness, communication, check-in, accuracy, location, value)
- **Messaging System**: Real-time communication between guests and hosts
- **Conversation Management**: Organized chat threads with archiving and blocking capabilities
- **Cancellation Policies**: Flexible, moderate, strict, and super-strict booking cancellation options
- **Instant Booking**: Automatic confirmation for eligible properties
- **Favorites System**: Save and manage favorite properties
- **Status Management**: Comprehensive booking status workflow (pending, confirmed, cancelled, completed, rejected)

### Database Models
- **Users**: Authentication, profiles, roles (user/host/admin), favorites
- **Properties**: Detailed property information with amenities, availability, pricing
- **Bookings**: Complete reservation system with status management and cancellation policies
- **Reviews**: Multi-category rating system with host responses
- **Messages**: Real-time messaging system
- **Conversations**: Organized chat threads with archiving and blocking

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd airbnb-clone-project
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/airbnb-clone
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

5. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately:
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 3000
   ```

## 📁 Project Structure

```
airbnb-clone-project/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (auth)
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── package.json            # Backend dependencies
└── README.md              # This file
```

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend client
- `npm run install-all` - Install dependencies for both frontend and backend

### Client Directory
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Properties
- `GET /api/properties` - Get all properties with filters
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/favorite` - Toggle favorite

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings (as guest or host)
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id` - Update booking details
- `DELETE /api/bookings/:id` - Delete booking
- `POST /api/bookings/:id/favorite` - Toggle property favorite

### Reviews
- `POST /api/reviews` - Create new review
- `GET /api/reviews/property/:propertyId` - Get property reviews
- `GET /api/reviews/user` - Get user's reviews
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review
- `POST /api/reviews/:id/response` - Add host response
- `POST /api/reviews/:id/helpful` - Mark review as helpful
- `DELETE /api/reviews/:id` - Delete review

### Messaging
- `POST /api/messages/conversations` - Create or get conversation
- `GET /api/messages/conversations` - Get user's conversations
- `GET /api/messages/conversations/:id` - Get conversation by ID
- `POST /api/messages/conversations/:id/messages` - Send message
- `GET /api/messages/conversations/:id/messages` - Get conversation messages
- `PUT /api/messages/conversations/:id/archive` - Archive/unarchive conversation
- `PUT /api/messages/conversations/:id/block` - Block/unblock conversation
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reactions` - Add reaction to message
- `DELETE /api/messages/:id/reactions` - Remove reaction from message

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🎨 Customization

### Styling
The project uses Tailwind CSS with custom color schemes. You can modify:
- `client/tailwind.config.js` - Custom colors and theme
- `client/src/index.css` - Global styles and component classes

### Components
All React components are built with reusability in mind. You can easily:
- Modify existing components in `client/src/components/`
- Add new pages in `client/src/pages/`
- Extend the authentication context in `client/src/context/`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers and protection

## 📱 Responsive Design

The application is fully responsive and includes:
- Mobile-first navigation
- Responsive property cards
- Adaptive search forms
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## 🚀 Deployment

### Frontend (React)
```bash
cd client
npm run build
# Deploy the build folder to your hosting service
```

### Backend (Node.js)
```bash
# Set NODE_ENV=production
npm start
# Or use PM2 for production process management
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Airbnb for inspiration
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB and Mongoose for the database solution

## 📞 Support

If you have any questions or need help, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Happy coding! 🎉**
