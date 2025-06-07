# YouTube Backend API

This is the backend API for your YouTube-like application, built with Node.js, Express, and MongoDB.

---

## 🚀 Deployment

Your backend is live at:  
**[https://yt-backend-iweb.onrender.com](https://yt-backend-iweb.onrender.com)**

---

## 📚 API Documentation

### Postman Collection & Environment

- **Postman Collection:**  
  [Open Collection](https://postman.co/workspace/My-Workspace~93308386-62d6-4acc-89f9-7c499ca98303/collection/25927552-90eace70-a609-4fc2-80b7-4a7ee5b2b758?action=share&creator=25927552&active-environment=25927552-a66bea34-99ac-4362-9018-88e0d9c9f154)

- **Postman Environment:**  
  [Open Environment](https://postman.co/workspace/My-Workspace~93308386-62d6-4acc-89f9-7c499ca98303/collection/undefined?action=share&creator=25927552&active-environment=25927552-a66bea34-99ac-4362-9018-88e0d9c9f154)

---

## 🛣️ API Base URL

```
https://yt-backend-iweb.onrender.com/api/v1/
```

---

## 🗂️ Main Endpoints

| Resource      | Endpoint Example                                      | Description                       |
|---------------|-------------------------------------------------------|-----------------------------------|
| User          | `/user/register`                                      | Register a new user               |
| User          | `/user/login`                                         | Login a user                      |
| Video         | `/video`                                              | Get all videos                    |
| Playlist      | `/playlist/user/:userId`                              | Get all playlists for a user      |
| Subscription  | `/subscription/c/:subscriberId`                       | Get channels a user is subscribed to |
| Subscription  | `/subscription/u/:channelId`                          | Get subscribers of a channel      |
| Tweet         | `/tweet/user/:userId`                                 | Get all tweets by a user          |
| Like          | `/like/video/:videoId`                                | Like a video                      |
| Comment       | `/comment/video/:videoId`                             | Get comments for a video          |

> **Note:** All endpoints are prefixed with `/api/v1/`.

---

## 🔑 Authentication

- Most endpoints require JWT authentication.
- Pass your token in the `Authorization` header as:  
  ```
  Authorization: <your_token>
  ```

---

## 🧑‍💻 How to Use

1. **Import the Postman collection and environment using the links above.**
2. **Set the environment to use the correct base URL and tokens.**
3. **Test endpoints directly from Postman or use `curl`/any HTTP client.**

---

## 📝 Notes

- Make sure to whitelist your IP in MongoDB Atlas if running locally.
- For any issues, check your `.env` file and deployment logs.

---

**Happy Coding!**