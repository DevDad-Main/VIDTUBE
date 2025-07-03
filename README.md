# VIDTUBE 🎥  
*A lightweight YouTube-style backend API built with Node.js, Express, and MongoDB.*

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

---

## 📦 About the Project

**VIDTUBE** is a backend REST API designed to simulate core functionalities of a video sharing platform like YouTube. It provides robust features for user registration, authentication, video uploads, profile management, and error handling â€” all while following MVC architecture and RESTful principles.

---

## 🚀 Tech Stack

- **Node.js** & **Express.js** â€“ Web server and routing
- **MongoDB** & **Mongoose** â€“ NoSQL database and ODM
- **Multer** â€“ File uploads (avatars, profile pictures)
- **Winston** & **Morgan** â€“ Logging and error tracking
- **Postman** â€“ API testing and documentation

---

## 📁 Project Structure (MVC)

```
VIDTUBE/
â”‚
â”œâ”€â”€ config/             # DB connection, logger setup
â”œâ”€â”€ controllers/        # Route logic
â”œâ”€â”€ middleware/         # Error handlers, auth checks, etc.
â”œâ”€â”€ models/             # Mongoose schemas
â”œâ”€â”€ routes/             # All endpoint definitions
â”œâ”€â”€ uploads/            # Stored user images (avatars/profile pics)
â”œâ”€â”€ utils/              # Reusable utilities (e.g., error handlers)
â”œâ”€â”€ app.js              # Main application entry
â”œâ”€â”€ .env                # Environment variables
â””â”€â”€ README.md
```

---

## ðŸ” Core Features

- âœ… **User Authentication** (JWT-based)
- âœ… **Video Uploads** (Metadata only, no actual video streaming)
- âœ… **User Profile Management**
- âœ… **Avatar/Profile Image Upload** (via Multer)
- âœ… **Error Handling & Logging** (Winston + Morgan)
- âœ… **RESTful API Design**
- âœ… **API Testing via Postman**

---

## ðŸ§ª Running Locally

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/vidtube-backend.git
cd vidtube-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a `.env` File

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Start the Server

```bash
npm run dev
```

> The API will be live at `http://localhost:5000`

---

## ðŸ“® Example API Endpoints

| Method | Endpoint               | Description                 |
|--------|------------------------|-----------------------------|
| POST   | `/api/auth/register`   | Register a new user         |
| POST   | `/api/auth/login`      | Login and get token         |
| GET    | `/api/users/:id`       | Get user profile            |
| PUT    | `/api/users/:id`       | Update profile & avatar     |
| POST   | `/api/videos/`         | Upload a new video metadata |
| GET    | `/api/videos/`         | Get all videos              |

---

## ðŸ›  Error Handling

- **Morgan** logs HTTP request details.
- **Winston** handles application-level errors and logs them to the console (and optionally files).
- Custom middleware catches unhandled routes and errors.

---

## ðŸ“¤ File Uploads

- User avatars and profile pictures are uploaded via **Multer**.
- Files are stored in the `/uploads` directory with unique filenames.

---

## ðŸ“Œ Future Features (Planned)

- Video streaming support
- Comments & likes system
- Subscriptions
- Admin panel & moderation tools

---

## ðŸ§‘â€ðŸ’» Author

**Olly** â€“ *Backend Developer*  
ðŸ“§ [your.email@example.com]  
ðŸŒ [Portfolio or LinkedIn/GitHub link]

---

## ðŸ“ƒ License

This project is open-source and available under the [MIT License](LICENSE).

---