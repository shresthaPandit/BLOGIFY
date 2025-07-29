# 🚀 BLOGIFY - Modern Blogging Platform

A full-stack blogging application built with Node.js, Express, MongoDB, and EJS. Features AI-powered chatbot assistance, user authentication, image uploads, and a modern responsive design.
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue)
![Express](https://img.shields.io/badge/Express-4.18+-orange)

#📝live 
  https://blogify-z0b8.onrender.com

## ✨ Features

### 🎨 **Modern UI/UX**
- Responsive design that works on all devices
- Clean and intuitive user interface
- Real-time chat interface with AI assistant
- Smooth animations and transitions

### 🤖 **AI-Powered Chatbot**
- Integrated Gemini AI for intelligent responses
- Context-aware blog recommendations
- Writing tips and advice
- Fallback system for reliability
- Rotating loading animations

### 👤 **User Management**
- Secure user authentication with JWT
- User registration and login
- Profile management with avatar uploads
- Session management

### 📝 **Blog Management**
- Create, edit, and delete blog posts
- Rich text editor with image support
- Image upload to cloud storage (AWS S3)
- Blog categorization and search
- Real-time preview

### 👤 **Profile Management**
- Profile image upload to AWS S3 (persistent storage)
- Automatic cleanup of old profile images
- Secure file validation and size limits
- Images persist across server restarts

### 💬 **Interactive Features**
- Comment system on blog posts
- Like and share functionality
- User engagement tracking
- Social media integration

### 🔒 **Security Features**
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CSRF protection
- Rate limiting

## 🛠️ Tech Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

### **Frontend**
- **EJS** - Template engine
- **CSS3** - Styling with modern features
- **JavaScript** - Client-side functionality
- **Bootstrap** - Responsive components

### **AI & Services**
- **Google Gemini AI** - Chatbot intelligence
- **AWS S3** - Image storage
- **Multer** - File upload handling

### **Development Tools**
- **Nodemon** - Development server
- **Dotenv** - Environment variables
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Google Gemini API key
- AWS S3 bucket (optional for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shresthaPandit/BLOGIFY.git
   cd BLOGIFY
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=8001
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   
   # Optional: AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-bucket-name
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8001`

## 📱 Features Demo

### 🤖 AI Chatbot
- **Smart Responses**: Context-aware AI assistance
- **Blog Integration**: Recommends relevant blog posts
- **Writing Help**: Provides writing tips and advice
- **Reliable**: Fallback system ensures always-on service

### 📝 Blog Creation
- **Rich Editor**: Create beautiful blog posts
- **Image Upload**: Drag & drop image support
- **Real-time Preview**: See changes as you type
- **SEO Optimized**: Meta tags and descriptions

### 👥 User Experience
- **Responsive Design**: Works perfectly on all devices
- **Fast Loading**: Optimized for performance
- **Intuitive Navigation**: Easy-to-use interface
- **Modern UI**: Clean and professional design

## 🔧 Configuration

### MongoDB Atlas Setup
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Set up database access with username/password
4. Configure network access (allow all IPs for development)
5. Get your connection string

### Google Gemini AI Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file

### AWS S3 Setup (Optional)
1. Create an AWS account
2. Create an S3 bucket
3. Create an IAM user with S3 permissions
4. Get access keys and add to `.env`

## 📁 Project Structure

```
blogapp/
├── controllers/          # Route controllers
│   ├── chatController.js # AI chatbot logic
│   └── ...
├── middlewares/          # Custom middleware
│   └── authentication.js # JWT authentication
├── model/               # Database models
│   ├── blogs.js         # Blog post model
│   ├── users.js         # User model
│   └── ...
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── images/         # Static images
├── routes/              # API routes
│   ├── blog.js         # Blog routes
│   ├── user.js         # User routes
│   └── ...
├── services/            # Business logic
│   ├── gemini.js       # AI service integration
│   └── authentication.js
├── views/               # EJS templates
│   ├── partials/       # Reusable components
│   └── ...
└── index.js            # Main application file
```

## 🚀 Deployment

### Render (Recommended)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Configure environment variables

### Heroku
1. Create Heroku app
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy with `git push heroku main`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent chatbot capabilities
- **MongoDB Atlas** for reliable database hosting
- **AWS S3** for scalable image storage
- **Express.js** community for the excellent framework
- **Bootstrap** for responsive design components

## 📞 Support

If you have any questions or need help:

- **Issues**: [GitHub Issues](https://github.com/shresthaPandit/BLOGIFY/issues)
- **Email**: shresthapandit8@gmail.com
- **LinkedIn**: [Your LinkedIn]

---

⭐ **Star this repository if you found it helpful!**

Made with ❤️ by Shrestha Pandit
