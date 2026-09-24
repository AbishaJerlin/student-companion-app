# Student Companion App

Student Companion is a full-stack web application that brings useful student tools into one place.

I worked mainly on developing the frontend as a React single-page application, building the main interface and connecting the different features into one consistent experience. I also worked with the backend APIs and service integration so that the frontend could store and retrieve data through MongoDB.

The application includes authentication, expense tracking, planning tools, events, wellbeing features, a personal diary, a community feed and profile management.

## Features

### Authentication

Users can register, log in and manage their account through a dedicated authentication service.

### Expense Tracking

Students can record and manage expenses and view their spending information from the main application.

### Planner and Events

The application includes planning and calendar features to help students organise activities, tasks and events.

### Wellbeing

The wellbeing section gives students a dedicated space to keep track of their wellbeing alongside their other student activities.

### Personal Diary

Students can create and manage personal diary entries within the application.

### Community Feed

The community feed provides a social-style space for posts, likes and comments.

### Profile Management

Students can manage their profile information through a separate profile service connected to MongoDB.

## My Work

My main focus was the frontend of the application.

I developed the React interface and worked on bringing the different parts of the system together into a single-page application. This included the main layouts, navigation, feature screens and reusable interface elements.

I also worked with the backend APIs and service integration so that the frontend could communicate with the authentication, profile, expense and feed services.

This gave me practical experience with React application development, API integration, MongoDB-backed data and running a multi-service application with Docker.

## Architecture

The application uses a microservice-based structure.

```text
Student Companion
│
├── React Frontend
│
├── Auth Service
│
├── Profile Service
│
├── Expense Service
│
├── Feed Service
│
└── MongoDB
```

The React frontend communicates with the backend services through REST APIs. The backend responsibilities are separated into individual Node.js services, while MongoDB is used for persistent data storage.

Docker Compose is used to run the frontend, backend services and database together.

## Technologies Used

### Frontend

- React
- JavaScript
- Vite
- HTML
- CSS
- FullCalendar
- Recharts
- Nginx

### Backend

- Node.js
- Express
- REST APIs
- MongoDB
- Mongoose

### Development and Deployment

- Docker
- Docker Compose
- Render
- PowerShell

## Project Structure

```text
student-companion-app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── config/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
├── services/
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   ├── expense-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   ├── feed-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   └── profile-service/
│       ├── Dockerfile
│       ├── package.json
│       └── server.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── render.yaml
├── start-services.ps1
├── stop-services.ps1
├── LICENSE
└── README.md
```

## Running the Application

Make sure Docker is installed and running.

Clone the repository:

```bash
git clone <your-repository-url>
cd student-companion-app
```

Create a local `.env` file from `.env.example` and add the email credentials required by the authentication service.

Then start the application:

```bash
docker compose up --build
```

The local services use the following ports:

| Service | Port |
|---|---:|
| Frontend | 80 |
| Auth Service | 5001 |
| Profile Service | 5002 |
| Expense Service | 5003 |
| Feed Service | 5006 |
| MongoDB | 27018 |

MongoDB runs inside its container on port `27017` and is exposed locally on port `27018`.

To stop the application:

```bash
docker compose down
```

## Environment Variables

The authentication service uses the following environment variables for email functionality:

```text
EMAIL_USER
EMAIL_PASSWORD
```

An `.env.example` file is included to show the required variable names. Actual credentials should be stored in `.env` and should not be committed to GitHub.

## Deployment

The project includes a `render.yaml` configuration for deploying the frontend and backend services separately on Render.

The frontend is configured to connect to the deployed authentication, profile, expense and feed service URLs through environment variables.

## What I Learned

This project gave me practical experience building a larger application where one frontend communicates with several independent backend services.

Working on the React frontend helped me improve my understanding of component-based development, application state, user interface design and API integration. I also gained more experience working with MongoDB, Docker and Docker Compose.

Bringing the frontend, backend services and database together helped me understand how the different parts of a full-stack application communicate and work as one system.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
