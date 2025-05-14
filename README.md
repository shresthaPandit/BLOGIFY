# Blogify

A modern blog application built with Node.js, Express, and MongoDB. Features include user authentication, blog post creation, comments, and file uploads.

## Features

- User authentication (signup/signin)
- Blog post creation with cover images
- Comments on blog posts
- Profile picture upload
- Modern, responsive design
- Delete functionality for blog posts

## Tech Stack

- Node.js
- Express.js
- MongoDB
- EJS Templates
- Bootstrap 5
- JWT Authentication

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd blogapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

4. Start the development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

## Directory Structure

- `/model` - Database models
- `/routes` - Route handlers
- `/views` - EJS templates
- `/public` - Static files
- `/middlewares` - Custom middleware functions

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC 