# 🎓 CampusHire — College Placement Management System

> A modern full-stack web application designed to streamline college placement activities by connecting **students, recruiters, and administrators** through a centralized placement management platform.

CampusHire helps colleges manage student profiles, job opportunities, applications, eligibility, recruitment workflows, and placement analytics from a single system.

---

## 🚀 Project Overview

Managing campus placements through spreadsheets, forms, and manual communication can become difficult as the number of students and companies increases.

**CampusHire** provides a centralized platform where:

* 👨‍🎓 Students can create profiles, view eligible opportunities, and apply for jobs.
* 🏢 Administrators can manage companies and job opportunities.
* 📋 Administrators can review and update student applications.
* 📊 Placement statistics and recruitment analytics can be monitored through an interactive dashboard.
* 📱 The interface is responsive and optimized for desktop and mobile screens.

---

## ✨ Key Features

### 👨‍🎓 Student Module

* Student registration and authentication
* Student profile management
* CGPA and skills management
* Profile completeness tracking
* View available placement opportunities
* Automatic eligibility checking
* Eligibility based on:

  * Minimum CGPA
  * Required technical skills
* Job search and filtering
* Application submission
* View application history
* Track application status
* Responsive student dashboard

### 🛠️ Admin Module

* Admin dashboard
* Placement statistics
* Total students tracking
* Company management
* Job opportunity management
* Add new placement opportunities
* Edit existing jobs
* Close and reopen job opportunities
* Job deadline validation
* CGPA validation
* Required skills validation
* Student management
* Application management
* Update application status
* Placement performance analytics
* Application status distribution
* Job opportunity analytics
* Company-wise application statistics
* Placement funnel visualization

### 📊 Analytics

CampusHire provides real-time dashboard insights including:

* Total Students
* Total Companies
* Active Jobs
* Total Applications
* Shortlisted Students
* Selected Students
* Placement Rate
* Application Status Distribution
* Job Availability
* Company-wise Applications
* Recruitment Funnel

---

## 🧑‍💻 Technology Stack

### Frontend

| Technology   | Purpose                 |
| ------------ | ----------------------- |
| React.js     | User Interface          |
| JavaScript   | Application Logic       |
| Tailwind CSS | Responsive UI & Styling |
| React Router | Client-side Routing     |
| Lucide React | UI Icons                |

### Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Runtime Environment |
| Express.js | REST API Framework  |
| MongoDB    | Database            |
| Mongoose   | MongoDB ODM         |

### Development Tools

| Tool    | Purpose                |
| ------- | ---------------------- |
| Git     | Version Control        |
| GitHub  | Source Code Management |
| VS Code | Development            |
| Postman | API Testing            |
| Vite    | Frontend Build Tool    |

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      CampusHire     │
                    │     Web Platform    │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
        ┌────────▼────────┐       ┌─────────▼────────┐
        │  Student Panel  │       │   Admin Panel    │
        └────────┬────────┘       └─────────┬────────┘
                 │                          │
                 └────────────┬─────────────┘
                              │
                     ┌────────▼────────┐
                     │   REST APIs     │
                     │ Node + Express  │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │    MongoDB      │
                     │    Database     │
                     └─────────────────┘
```

---

## 🔄 Application Workflow

### Student Workflow

```text
Register / Login
       ↓
Complete Profile
       ↓
Enter CGPA & Skills
       ↓
View Available Jobs
       ↓
Check Eligibility
       ↓
Apply for Job
       ↓
Track Application
       ↓
Shortlisted / Selected / Rejected
```

### Admin Workflow

```text
Admin Login
    ↓
Dashboard
    ↓
Manage Companies
    ↓
Create Job Opportunity
    ↓
Review Applications
    ↓
Update Application Status
    ↓
Monitor Placement Analytics
```

---

## 🔌 REST API Structure

### Dashboard

```http
GET /dashboard
```

### Admin APIs

```http
GET    /admin/students
GET    /admin/applications

PUT    /admin/applications/:id
```

### Company & Job APIs

```http
GET    /company/all
POST   /company

PUT    /company/:id
PUT    /company/:id/close
PUT    /company/:id/reopen
```

### Student APIs

```http
GET    /student/profile
GET    /company
GET    /application/my

POST   /application
```

---

## 🔐 Authentication & Authorization

CampusHire uses authentication to separate access between users.

### Student

Students can:

* Access their own profile
* View available opportunities
* Apply for eligible jobs
* Track their applications

### Admin

Administrators can:

* View registered students
* Manage companies
* Manage job opportunities
* Review applications
* Update application statuses
* Monitor placement analytics

---

## ✅ Job Validation

The application includes frontend validation for job creation and editing.

Validation includes:

* Package must be greater than `0`
* CGPA must be between `0` and `10`
* At least one required skill must be provided
* Deadline is required
* Deadline cannot be in the past

This helps prevent invalid placement data from entering the system.

---

## 📱 Responsive Design

CampusHire is designed to work across different screen sizes.

### Desktop

* Dashboard analytics
* Data tables
* Job management
* Student management
* Application management

### Mobile

* Responsive navigation
* Student cards
* Application cards
* Job cards
* Responsive forms
* Mobile-friendly dashboard layout

---

## 📂 Project Structure

```text
CampusHire/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
└── backend/
    │
    ├── routes/
    ├── controllers/
    ├── models/
    ├── middleware/
    ├── server.js
    └── package.json
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shirkemitali62/CampusHire-College-Placement-Management-System-.git
```

```bash
cd CampusHire
```

---

### 2. Setup Frontend

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend will run on the Vite development server.

---

### 3. Setup Backend

Open another terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start backend:

```bash
npm start
```

or, if the project uses nodemon:

```bash
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> Do not commit `.env` files or database credentials to GitHub.

---

## 🧪 Testing

Frontend lint verification:

```bash
npm run lint
```

Production build verification:

```bash
npm run build
```

Current project verification:

```text
✓ ESLint passed
✓ Vite production build passed
✓ 1920 modules transformed
✓ Production dist generated successfully
```

---

## 📊 Example Placement Dashboard

The admin dashboard provides an overview of:

```text
Total Students       → 2
Companies            → 1
Active Jobs          → 1
Applications         → 1
Selected             → 0
Placement Rate       → 0%
```

Application workflow:

```text
Registered → Applied → Shortlisted → Selected
```

The dashboard treats an application as having passed through the **Applied** stage once it has been submitted, even when its current status is Shortlisted, Selected, or Rejected.

---

## 🎯 Future Enhancements

Possible future improvements include:

* 📧 Email notifications for application updates
* 📄 Resume upload and management
* 🤖 AI-based job recommendation
* 🤖 Resume-job matching
* 📅 Interview scheduling
* 🔔 Real-time notifications
* 📈 Advanced placement reports
* 📊 Export analytics to PDF/Excel
* 🏢 Dedicated recruiter/company portal
* 🔐 Role-based access control enhancements
* ☁️ Production deployment with CI/CD

---

## 💡 What This Project Demonstrates

CampusHire demonstrates practical knowledge of:

* Full-stack web development
* React.js application development
* REST API integration
* CRUD operations
* MongoDB database integration
* Authentication and authorization
* Form validation
* State management
* Responsive UI development
* Dashboard development
* Data visualization
* Application workflow management
* Git & GitHub
* Production build validation

---

## 🏆 Project Highlights

### 🎓 Placement Management

Centralized management of college recruitment activities.

### 📊 Data-Driven Dashboard

Interactive analytics help administrators understand placement performance.

### ⚡ Real-Time Application Tracking

Students can track their application status while administrators manage recruitment stages.

### 📱 Responsive Experience

The platform adapts to desktop and mobile screen sizes.

### 🛡️ Validation

Job and application workflows include validation to improve data quality.

---

## 👩‍💻 Developer

**Mitali Shirke**

BCA Student | Full-Stack Developer

Interested in:

* Full-Stack Development
* React.js
* Node.js
* MongoDB
* Python
* Data Analytics
* Software Engineering

---

## 📌 Project Status

**Status:** 🟢 Completed — Placement Ready

The current frontend has been verified with:

```bash
npm run lint
```

and

```bash
npm run build
```

Both commands complete successfully.

---

## ⭐ If You Like This Project

If you find CampusHire useful or interesting, consider giving the repository a ⭐ on GitHub.

---

### 📄 License

This project is developed for educational and portfolio purposes.
