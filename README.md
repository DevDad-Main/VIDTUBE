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

## 📁 Project Structure (MVC)

```
VIDTUBE/
│
├── config/              ──┐
│   └── db.js               # Database connection setup
│   └── logger.js           # Winston logging configuration
│
├── controllers/         ──┐
│   └── auth.controller.js  # Auth logic
│   └── video.controller.js # Video logic
│   └── user.controller.js  # User profile logic
│
├── middleware/          ──┐
│   └── authMiddleware.js   # JWT validation
│   └── errorHandler.js     # Global error handler
│
├── models/              ──┐
│   └── User.js             # User schema
│   └── Video.js            # Video schema
│
├── routes/              ──┐
│   └── auth.routes.js      # Auth routes
│   └── video.routes.js     # Video routes
│   └── user.routes.js      # User routes
│
├── uploads/             ──┐
│   └── avatars/            # Uploaded profile pictures
│
├── utils/               ──┐
│   └── generateToken.js    # JWT helper
│
├── .env                   # Environment variables
├── app.js                 # App entry point
└── README.md              # Project documentation
```

---

## 🔐 Core Features

- ✅ **User Authentication** (JWT-based)
- ✅ **Video Uploads** (Metadata only, no actual video streaming)
- ✅ **User Profile Management**
- ✅ **Avatar/Profile Image Upload** (via Multer)
- ✅ **Error Handling & Logging** (Winston + Morgan)
- ✅ **RESTful API Design**
- ✅ **API Testing via Postman**

---

## 🧪 Running Locally

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



 Author

Olly – Aspiring Junior Backend Developer
📧 [softwaredevdad@gmail.com]


---

📃 License

This project is open-source and available under the MIT License.


---

6 Example API Endpoints

| Method | Endpoint               | Description                 |
|--------|------------------------|-----------------------------|
| POST   | `/api/auth/register`   | Register a new user         |
| POST   | `/api/auth/login`      | Login and get token         |
| GET    | `/api/users/:id`       | Get user profile            |
| PUT    | `/api/users/:id`       | Update profile & avatar     |
| POST   | `/api/videos/`         | Upload a new video metadata |
| GET    | `/api/videos/`         | Get all videos              |

---

## 🛠️ Error Handling

- **Morgan** logs HTTP request details.
- **Winston** handles application-level errors and logs them to the console (and optionally files).
- Custom middleware catches unhandled routes and errors.

---

## 📤 File Uploads

- User avatars and profile pictures are uploaded via **Multer**.
- Files are stored in the Cloudinwry Databse with unique filenames.

---

## 📌 Future Features (Planned)

- [] Comments & likes system
- [] Subscriptions
- [] Admin panel & moderation tools

---

## 🧑‍💻 Author

**Olly** - *Backend Developer*  
📨 [softwaredevdad@gmail.com]  

---

## 🪪 License

This project is open-source and available under the [MIT License](LICENSE).

---