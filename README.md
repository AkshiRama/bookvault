# 📚 BookVault — Modern Library Management SaaS

> *"Your Library. Smarter. Simpler."*

BookVault is a centralized, production-grade Library & Book Management platform built from scratch with **React 18**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB (Mongoose)**. It provides a multi-tenant-grade role-based experience for **Admins**, **Librarians**, and **Students / Patrons**.

---

## 🌟 Key Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Three Persona Roles**:
  - **Admin**: Unrestricted administrative authority (user management, librarian credentials, delete operations, institutional settings).
  - **Librarian**: Operational management (book catalog, check-outs, returns, patron records, analytics).
  - **Member**: Self-service patron portal (book discovery, active loan tracking, due countdowns, personal fines ledger).
- **Security**:
  - Password hashing with **bcryptjs** (10 salt rounds).
  - Stateless authentication with **JWT** tokens and automatic verification.
  - Server-side role enforcement (strict **HTTP 403 Forbidden** on unauthorized routes).
  - Zero sensitive credential leaks in API responses.

### 📖 Catalog & Inventory Engine
- Complete CRUD operations on books with comprehensive bibliographic metadata (Title, Author, ISBN, Publisher, Published Year, Language, Pages, Quantity, Cover URL).
- Atomic stock management: `availableCopies` dynamically syncs with physical checkouts and returns.
- Safety guards: Books with active borrowings cannot be deleted. Total quantity cannot be reduced below currently issued copies.
- Server-side multi-parameter search (Title, Author, ISBN), category filtering, availability states, year filters, sorting, and pagination.

### 🔄 Circulation & Automated Overdue Engine
- Fast book checkout / return processing with live member active-loan limit verification.
- **Auto-Overdue Engine**: Dynamic comparison of return timestamps against due dates.
- Automatic fine calculation:
  $$\text{Fine} = \max(0, \text{ReturnDate} - \text{DueDate}) \times \text{FinePerDay}$$
- Configurable fine rates and loan durations via Admin Library Settings.

### 📊 Reports & Visual Analytics
- Interactive dashboards powered by **Recharts** (Borrowing activity area chart, inventory status donut, category distribution bar chart).
- Pre-built reports: Most Borrowed Books, Most Active Patrons, Overdue Risk Analysis, Category Distributions, Monthly Checkout Trends.
- 1-Click **Export to CSV** and formatted **Print View**.

### 💻 Seamless Zero-Config Database (Dual-Mode MongoDB)
- Connects automatically to `MONGO_URI` if an external or local daemon is running.
- **Embedded Fallback**: Automatically spins up an embedded `mongodb-memory-server` if an external MongoDB daemon is not detected. Works 100% out of the box on any system without manual MongoDB installation!

---

## 🚀 Demo Credentials

The database is pre-seeded with realistic sample books, active patrons, and the following accounts:

| Role | Email | Password | Clearance Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bookvault.com` | `Admin@123` | Full system control |
| **Librarian** | `librarian@bookvault.com` | `Librarian@123` | Daily circulation operations |
| **Member** | `member@bookvault.com` | `Member@123` | Self-service student portal |

> **Tip**: The login page includes **One-Click Demo Credentials Buttons** for instant access as any of the three roles!

---

## 📂 Project Structure

```
bookvault/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Modals, Tables, Cards, Skeletons, Badges
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Role Dashboards, Catalog, Circulation, Reports, Settings
│   │   ├── routes/             # ProtectedRoute, RoleGuard, AccessDenied
│   │   ├── services/           # Axios REST API client
│   │   ├── App.jsx             # Main Router
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js + Express + Mongoose Backend
│   ├── config/                 # Resilient MongoDB connector (db.js)
│   ├── controllers/            # Auth, Book, Member, Librarian, Borrowing, Reports, Settings
│   ├── middleware/             # requireAuth, requireRole, errorHandler
│   ├── models/                 # User, Book, Member, Borrowing, Settings
│   ├── routes/                 # REST endpoints
│   ├── seed/                   # Realistic database seeder
│   ├── server.js
│   └── package.json
│
├── .env.example
├── README.md
└── package.json                # Monorepo orchestration scripts
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 1. Clone or Navigate to Project
```bash
cd bookvault
```

### 2. Install Server & Client Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Seed Database
```bash
cd ../server
npm run seed
```

### 4. Run Application
In two separate terminal windows:

```bash
# Terminal 1: Backend API (port 5000)
cd server
node server.js
```

```bash
# Terminal 2: Frontend Client (port 5173)
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🛡️ API Permissions Matrix

| Endpoint | Method | Admin | Librarian | Member |
| :--- | :--- | :---: | :---: | :---: |
| `/api/auth/login` | POST | ✅ | ✅ | ✅ |
| `/api/auth/me` | GET | ✅ | ✅ | ✅ |
| `/api/books` | GET | ✅ | ✅ | ✅ |
| `/api/books` | POST | ✅ | ✅ | ❌ |
| `/api/books/:id` | PUT | ✅ | ✅ | ❌ |
| `/api/books/:id` | DELETE | ✅ | ❌ | ❌ |
| `/api/members` | GET, POST, PUT | ✅ | ✅ | ❌ |
| `/api/members/:id` | DELETE | ✅ | ❌ | ❌ |
| `/api/librarians` | ALL | ✅ | ❌ | ❌ |
| `/api/borrowings/issue` | POST | ✅ | ✅ | ❌ |
| `/api/borrowings/:id/return`| PUT | ✅ | ✅ | ❌ |
| `/api/member/*` | GET | ❌ | ❌ | ✅ (Own Only) |
| `/api/reports/*` | GET | ✅ | ✅ | ❌ |
| `/api/settings` | PUT | ✅ | ❌ | ❌ |

---

## 📄 License
MIT License. Crafted with precision for enterprise and institutional libraries.
