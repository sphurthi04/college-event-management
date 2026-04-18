# 🎓 College Event Management System

A complete end-to-end web application for managing college events, venue scheduling, inter-college invitations, student registrations, AI-based venue capacity estimation, certificate generation, and chatbot support.

---

## 📁 Project Structure

```
college-event-management/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Login, Register, Verify
│   │   ├── adminController.js      # Dashboard, Approvals
│   │   ├── venueController.js      # CRUD Venues
│   │   ├── eventController.js      # CRUD Events + Clash Detection
│   │   ├── registrationController.js # Register, Attendance
│   │   ├── invitationController.js # Inter-college Invitations
│   │   ├── certificateController.js # PDF Certificate Generation
│   │   ├── collegeController.js    # College Management
│   │   ├── chatbotController.js    # FAQ Chatbot
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT + Role-based Auth
│   │   └── upload.js               # Multer File Upload
│   ├── models/
│   │   ├── User.js                 # Admin/Organizer/Student
│   │   ├── College.js
│   │   ├── Venue.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   ├── Invitation.js
│   │   ├── Certificate.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── venueRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── invitationRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── collegeRoutes.js
│   │   ├── chatbotRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   └── emailService.js         # Nodemailer
│   ├── utils/
│   │   └── seedAdmin.js            # Seed sample data
│   ├── .env                        # Environment variables
│   ├── package.json
│   └── server.js                   # Entry point
│
├── frontend/                       # HTML + CSS + Vanilla JS
│   ├── css/
│   │   └── style.css               # Complete design system
│   ├── js/
│   │   └── api.js                  # API helpers + Auth guards
│   ├── pages/
│   │   ├── admin-dashboard.html
│   │   ├── admin-organizers.html
│   │   ├── admin-students.html
│   │   ├── admin-venues.html
│   │   ├── admin-colleges.html
│   │   ├── admin-events.html
│   │   ├── admin-invitations.html
│   │   ├── organizer-dashboard.html
│   │   ├── organizer-events.html
│   │   ├── organizer-venues.html
│   │   ├── organizer-registrations.html
│   │   ├── organizer-invitations.html
│   │   ├── organizer-certificates.html
│   │   ├── organizer-ai.html
│   │   ├── student-dashboard.html
│   │   ├── student-events.html
│   │   ├── student-registrations.html
│   │   ├── student-certificates.html
│   │   └── student-chatbot.html
│   ├── index.html                  # Login / Register page
│   └── verify-email.html           # Email verification
│
├── ai_module/                      # Python Flask AI Service
│   ├── app.py                      # Capacity estimation API
│   └── requirements.txt
│
├── database/
│   └── schema.js                   # MongoDB schema reference
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Python 3.8+
- npm or yarn
- A Gmail account (for Nodemailer)

---

### Step 1 — Clone / Navigate to Project

```bash
cd college-event-management
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Edit `.env` file with your credentials:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/college_events
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Admin credentials (no registration page - stored here only)
ADMIN_EMAIL=admin@college.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=System Admin

# Gmail SMTP (use App Password, not your real password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

AI_MODULE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate

Seed sample colleges:
```bash
npm run seed
```

Start backend:
```bash
npm run dev       # Development (nodemon)
npm start         # Production
```

Backend runs on: `http://localhost:5000`

---

### Step 3 — AI Module Setup

```bash
cd ai_module
pip install -r requirements.txt
python app.py
```

AI module runs on: `http://localhost:5001`

---

### Step 4 — Frontend Setup

The frontend is plain HTML/CSS/JS — no build step needed.

**Option A: VS Code Live Server**
- Install "Live Server" extension in VS Code
- Right-click `frontend/index.html` → Open with Live Server
- Runs on: `http://localhost:5500`

**Option B: Python HTTP Server**
```bash
cd frontend
python -m http.server 3000
```
Runs on: `http://localhost:3000`

**Option C: Node HTTP Server**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.com | Admin@123 |
| Organizer | Register → Wait for admin approval |
| Student | Register → Verify email → Login |

> Admin credentials are set in `.env` — no admin registration page exists.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (all roles) |
| POST | `/api/auth/register/student` | Student registration |
| POST | `/api/auth/register/organizer` | Organizer registration |
| GET | `/api/auth/verify-email` | Email verification |
| GET | `/api/auth/me` | Get current user |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/organizers` | List organizers |
| PUT | `/api/admin/organizers/:id/approve` | Approve organizer |
| PUT | `/api/admin/organizers/:id/reject` | Reject organizer |
| GET | `/api/admin/students` | List students |
| GET | `/api/admin/events` | All events |

### Venues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/venues` | List venues |
| POST | `/api/venues` | Create venue (Admin) |
| PUT | `/api/venues/:id` | Update venue (Admin) |
| DELETE | `/api/venues/:id` | Delete venue (Admin) |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/all` | Public events (students) |
| GET | `/api/events` | Organizer's events |
| POST | `/api/events` | Create event (Organizer) |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| GET | `/api/events/venue/:id/availability` | Check venue availability |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/registrations` | Register for event (Student) |
| GET | `/api/registrations/my` | My registrations (Student) |
| GET | `/api/registrations/event/:id` | Event registrations (Organizer) |
| PUT | `/api/registrations/:id/attendance` | Mark attendance (Organizer) |
| DELETE | `/api/registrations/:eventId` | Cancel registration (Student) |

### Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invitations` | Send invitation (Organizer) |
| GET | `/api/invitations` | List invitations |
| PUT | `/api/invitations/:id/status` | Update status (Admin) |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/certificates/generate` | Generate certificates (Organizer) |
| GET | `/api/certificates/my` | My certificates (Student) |
| GET | `/api/certificates/download/:id` | Download PDF |

### AI Module (Port 5001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/estimate-capacity` | Estimate from image |
| POST | `/estimate-by-dimensions` | Estimate from dimensions |
| GET | `/health` | Health check |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message` | Send message, get reply |

---

## 🔐 Security Features

- **bcrypt** password hashing (salt rounds: 12)
- **JWT** authentication with expiry
- **Role-based access control** (Admin / Organizer / Student)
- **Admin stored in .env** — no DB entry, no registration page
- **Organizer approval system** — pending until admin approves
- **Student email verification** — must verify before login
- **Venue clash detection** — prevents double-booking
- **Protected routes** — all API routes require valid JWT
- **File upload validation** — type and size limits

---

## 🤖 AI Module Details

The AI module provides two estimation methods:

1. **Image-based**: Upload venue photo → estimates capacity using file analysis
2. **Dimension-based**: Enter length × width + layout type → calculates using standard space-per-person ratios:
   - Theater: 6 sq ft/person
   - Classroom: 15 sq ft/person
   - Banquet: 12 sq ft/person
   - Reception: 8 sq ft/person
   - Conference: 25 sq ft/person

Returns: Maximum, Comfortable (75%), and Social Distancing (50%) capacities.

---

## 📧 Email Notifications

Emails are sent automatically for:
- Student email verification
- Organizer registration (admin notified)
- Organizer approval/rejection
- Event registration confirmation
- Inter-college invitation
- Certificate generation (with PDF attachment)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Certificates | PDFKit |
| File Upload | Multer |
| AI Module | Python Flask |
| HTTP Client | Fetch API |

---

## 🐛 Troubleshooting

**MongoDB connection failed**
```bash
# Start MongoDB service
mongod --dbpath C:/data/db
```

**Email not sending**
- Use Gmail App Password (not account password)
- Enable 2-Step Verification first
- Check EMAIL_USER and EMAIL_PASS in .env

**AI module not responding**
- Ensure Python Flask is running: `python app.py`
- Check port 5001 is not blocked

**CORS errors**
- Set `FRONTEND_URL` in `.env` to match your frontend URL
- Default allows all origins in development

**JWT errors**
- Ensure JWT_SECRET is set in .env
- Clear localStorage and login again
