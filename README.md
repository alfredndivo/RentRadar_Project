# 🏠 RentRadar - Modern Property Rental Platform

> A comprehensive property rental platform connecting landlords and tenants with advanced features like real-time messaging, property management, and admin controls.

## 🌟 Features

### For Tenants
- 🔍 **Advanced Property Search** - Filter by location, price, property type, and amenities
- 💾 **Save Favorites** - Bookmark properties for later viewing
- 💬 **Real-time Messaging** - Chat directly with landlords
- 📱 **Mobile Responsive** - Seamless experience across all devices
- 🗺️ **Interactive Maps** - View property locations with OpenStreetMap integration
- 📊 **Property Reports** - Report suspicious or fraudulent listings
- 🌙 **Dark Mode** - Toggle between light and dark themes

### For Landlords
- 🏢 **Property Management** - Create, edit, and manage property listings
- 📸 **Image Gallery** - Upload up to 6 high-quality property images
- 💬 **Tenant Communication** - Respond to inquiries through integrated messaging
- 📈 **Analytics Dashboard** - Track listing performance and views
- ✅ **Profile Verification** - Complete profile with ID verification
- 📋 **Report Management** - Handle tenant reports and feedback

### For Administrators
- 👥 **User Management** - Manage users, landlords, and their permissions
- 🚨 **Report Handling** - Review and resolve user-submitted reports
- 📊 **Platform Analytics** - Monitor platform usage and growth metrics
- 🔧 **System Controls** - Ban/unban users and moderate content


## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RentRadar-Project.git
   cd RentRadar-Project
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install

   # Environment
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

   Create `.env` file in the client directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start the application**
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from client directory)
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
RentRadar-Project/
├── client/                     # React frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   ├── userdashboard/ # Tenant dashboard pages
│   │   │   ├── Landlorddashboard/ # Landlord dashboard pages
│   │   │   └── AdminDashboard/ # Admin dashboard pages
│   │   ├── utils/             # Utility functions
│   │   └── index.css          # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js backend application
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   ├── uploads/              # File uploads directory
│   ├── package.json
│   └── server.js             # Main server file
├── .github/
│   └── workflows/            # GitHub Actions workflows
├── README.md
└── package.json              # Root package.json
```

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support** - Toggle between light and dark themes
- **Modern Animations** - Smooth transitions and micro-interactions
- **Image Lightbox** - Full-screen image viewing with navigation
- **Real-time Updates** - Live messaging and notifications
- **Progressive Loading** - Skeleton loaders for better UX
- **Form Validation** - Client and server-side validation
- **Error Handling** - Graceful error messages and fallbacks

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Role-based Access** - Different permissions for users, landlords, and admins
- **Input Validation** - Sanitization and validation of user inputs
- **File Upload Security** - Image type validation and size limits
- **CORS Protection** - Configured cross-origin resource sharing
- **Rate Limiting** - Protection against spam and abuse

## 🚀 Deployment



### Build Commands

```bash
# Build client for production
cd client
npm run build

# Start production server
cd server
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/yourusername/RentRadar-Project/issues) page to report bugs or request features.

## 📞 Support

For support and questions:
- Email: support@rentradar.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/RentRadar-Project/issues)

---
