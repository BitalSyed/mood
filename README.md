# Project Setup

## 🔧 Frontend Configuration

1. Navigate to the frontend directory.
2. Create or edit the `.env` file.
3. Add your backend URL:

```env
VITE_URL=http://localhost:4000
```

> Replace `http://localhost:4000` with the actual URL of your backend.

---

## 🛠️ Backend Configuration

1. Navigate to the backend directory.
2. Open the `.env` file.
3. Update your Mail Data, MongoDB and database details:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

> Replace `<username>`, `<password>`, and `<dbname>` with your actual MongoDB credentials and database name.

```env
MAIL_HOST="mail.skillrextech.com"
MAIL_USER="info@skillrextech.com"
MAIL_PASWORD="T3stP@ssw0rd!"
```

> Replace `support@skillrextech.com`, `mail.skillrextech.com` and `T3stP@ssw0rd!` with your actual MAIL credentials, APP PASSWORD and host.

---

## 🚀 Running the Project

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
npm install
node index.js
```

---

## ⚠️ Note
- Never commit your `.env` files to Git.
- Make sure the frontend `.env` is correctly pointing to your backend URL for API calls to work.
