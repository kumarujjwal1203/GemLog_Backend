# 📝 GemLog – MERN Stack Blogging Platform

## 🧩 Project Overview  
**GemLog** is a modern full-stack blogging application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It enables users to **create, manage, and share blogs** through a responsive, secure, and beautifully designed interface.  

---

## ✨ Core Features  
- 📝 **Blog Creation & Management (CRUD)**  
- ✍️ Rich-text editor with full formatting support  
- 🖼️ Post includes: Title, Content, Tags, Cover Image  
- 🔐 **User Authentication** (JWT-based secure login/signup)  
- 🌍 Public Blog Feed with explore/search page  
- 📱 Fully Responsive Design  

---

## ⚙️ Backend Design  

| Route                            | Purpose               | Method | Logic Description                          |
|----------------------------------|------------------------|--------|--------------------------------------------|
| `/user/register`                 | Register new user      | POST   | Hashes password, saves user to DB          |
| `/user/login`                    | User login             | POST   | Validates credentials, returns JWT         |
| `/user/profile`                  | Fetch current user     | GET    | Returns profile using token                |
| `/user/profile-picture`         | Upload profile picture | POST   | Saves image URL                            |
| `/user/profile-picture`         | Delete profile picture | DELETE | Removes image URL                          |
| `/user/follow/:userId`          | Follow a user          | POST   | Adds user to following                     |
| `/user/unfollow/:userId`        | Unfollow a user        | POST   | Removes user from following                |
| `/posts`                         | Get all posts          | GET    | Supports search, sort, and pagination      |
| `/posts/:id`                     | Get single post        | GET    | Returns specific post                      |
| `/posts`                         | Create a post          | POST   | Adds post with title, content, etc.        |
| `/posts/:id`                     | Update post            | PUT    | Modifies existing post                     |
| `/posts/:id`                     | Delete post            | DELETE | Deletes post                               |
| `/posts/:id/images/:imageIndex` | Delete image           | DELETE | Removes a specific image                   |
| `/posts/:id/like`               | Like a post            | POST   | Adds like to post                          |
| `/posts/:id/unlike`             | Unlike a post          | POST   | Removes like from post                     |
| `/posts/user/posts`             | Get user’s posts       | GET    | Authenticated user's posts only            |
| `/comments/post/:postId`        | Get post comments      | GET    | Fetches comments for a post                |
| `/comments`                     | Create comment         | POST   | Adds comment to a post                     |
| `/comments/:id`                 | Delete comment         | DELETE | Deletes a comment                          |

---

## 🧭 Frontend Design  

| Route           | Purpose             | Logic Summary                                 |
|----------------|---------------------|-----------------------------------------------|
| `/register`    | Register page       | Form → Axios POST → Store JWT token           |
| `/login`       | Login page          | Authenticate user → Redirect to home          |
| `/profile`     | User profile        | View/edit profile, manage profile picture     |
| `/create`      | Create blog post    | Rich text editor → Submit post                |
| `/edit/:id`    | Edit blog post      | Preload data → Update post                    |
| `/post/:id`    | View blog post      | View title, content, likes, and comments      |
| `/`            | Home/Explore        | Show all blogs with filters & search bar      |

---

## 🧬 MongoDB Schemas  

### 📄 User Schema
```js
{
  username: String,
  email: String,
  password: String,
  profilePicture: String,
  following: [ObjectId],
  follower: [ObjectId]
}
```
📄 Post Schema
```js
{
  title: String,
  content: String,
  tags: [String],
  images: [String],
  likes: [ObjectId],
  author: ObjectId
}
```

📄 Comment Schema
```js
{
  content: String,
  user: ObjectId,
  postId: ObjectId
}
```

📁 Folder Structure

🔙 Backend
```
    backend/
├── controllers/
│   ├── commentController.js
│   ├── postController.js
│   └── userController.js
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── commentRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── config/
│   └── db.js
├── utils/
│   └── sendEmail.js
├── .env
├── server.js
└── package.json

🖼️ Frontend
frontend/
├── src/
│   ├── components/
│   │   ├── Comment.jsx
│   │   ├── CommentActions.jsx
│   │   ├── CommentForm.jsx
│   │   ├── CommentList.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Login.jsx
│   │   ├── Navigation.jsx
│   │   ├── NotFound.jsx
│   │   ├── Pagination.jsx
│   │   ├── Post.jsx
│   │   ├── PostActions.jsx
│   │   ├── PostCard.jsx
│   │   ├── Posts.jsx
│   │   ├── Profile.jsx
│   │   ├── ProtectionRoute.jsx
│   │   ├── Register.jsx
│   │   ├── ReplyForm.jsx
│   │   ├── SearchBar.jsx
│   │   ├── SinglePost.jsx
│   │   ├── SortDropdown.jsx
│   │   ├── UserCard.jsx
│   │   ├── UserProfile.jsx
│   │   └── UserSearch.jsx
│   ├── hooks/
│   │   └── useCommentTree.js
│   ├── App.js
│   ├── index.js
├── public/
│   └── index.html
├── tailwind.config.js
└── package.json
```

🌱 Future Scope
💬 Comment replies and likes

🔍 Advanced search and filtering

📊 Blog analytics (views, read time, etc.)

🤖 AI content suggestions (OpenAI/Gemini)

🔑 OAuth login (Google, GitHub)

📧 Email notifications & newsletters

🔗 Custom user profiles with shareable links

✅ Conclusion
GemLog is a complete full-stack blogging platform developed using the MERN stack. It provides secure authentication, intuitive blog management, and interactive features like likes and comments. With a strong foundation, it’s ready for future expansion through additional features and integrations.


