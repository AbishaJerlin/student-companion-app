# Student Companion App

Student Companion is a full-stack web application designed to bring useful student tools into one place.

I worked mainly on developing the frontend as a React single-page application, building the main interface and connecting the different features into one consistent experience. I also worked with the backend APIs and service integration so that features could store and retrieve data through MongoDB.

The application includes expense tracking, planning tools, events, wellbeing features, a personal diary, a community feed and profile management.

## Features

### Authentication

The application includes user authentication with account registration and login functionality. Authentication is handled through a separate backend service.

### Expense Tracking

Students can record and manage their expenses through the application. The expense section provides an easier way to keep track of spending and view financial information from the main interface.

### Planner

The planner provides a space for students to organise their activities and keep track of upcoming tasks.

### Events

The application includes an events section where students can view and manage information related to events and activities.

### Wellbeing

The wellbeing section was designed to give students a dedicated space for keeping track of their wellbeing alongside their academic and everyday activities.

### Personal Diary

Students can use the diary feature to record personal notes and entries within the application.

### Community Feed

The community feed allows users to interact with shared content through a dedicated feed service.

### Profile Management

Students can manage their profile information through the application, with profile data stored through a separate backend service.

## My Work

My main focus was the frontend of the application.

I developed the React interface and worked on bringing the different parts of the system together into a single-page application. This included building the main layouts, navigation, reusable interface elements and feature screens.

I also worked on connecting the frontend with the backend APIs so that the interface could communicate with the authentication, profile, expense and feed services.

This involved working with:

- React components and application state
- frontend styling and responsive layouts
- API requests between the frontend and backend
- authentication flows
- expense and profile data
- service configuration
- MongoDB-backed data
- Docker-based local development

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

The React frontend communicates with the backend services through their APIs. Each main backend responsibility is separated into its own service, while MongoDB provides persistent data storage.

Docker is used to run the application components together in a consistent environment.

## Technologies Used

### Frontend

- React
- JavaScript
- Vite
- HTML
- CSS
- Nginx

### Backend

- Node.js
- Express
- REST APIs
- MongoDB

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
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── services/
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   │
│   ├── expense-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   │
│   ├── feed-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   │
│   └── profile-service/
│       ├── Dockerfile
│       ├── package.json
│       └── server.js
│
├── docker-compose.yml
├── render.yaml
├── start-services.ps1
├── stop-services.ps1
├── .gitignore
└── README.md
```

## Running the Application

### Using Docker Compose

Make sure Docker is installed and running.

Clone the repository:

```bash
git clone <your-repository-url>
cd student-companion-app
```

Start the application:

```bash
docker compose up --build
```

Docker Compose starts MongoDB together with the frontend and backend services.

The local services use the following ports:

| Service | Port |
|---|---:|
| Frontend | 80 |
| Auth Service | 5001 |
| Profile Service | 5002 |
| Expense Service | 5003 |
| Feed Service | 5006 |
| MongoDB | 27018 |

MongoDB runs internally on port `27017` and is exposed locally through port `27018`.

To stop the containers:

```bash
docker compose down
```

## Environment Variables

The authentication service uses environment variables for email functionality:

```text
EMAIL_USER
EMAIL_PASSWORD
```

These values should be configured locally and should not be committed to the repository.

The Docker configuration automatically provides the MongoDB connection information required by the individual services.

## Deployment

The project also includes a `render.yaml` configuration for deploying the application as separate services.

The deployment configuration defines:

- MongoDB
- authentication service
- profile service
- expense service
- feed service
- frontend

The frontend uses environment variables to connect to the deployed backend service URLs.

## What I Learned

This project gave me practical experience building a larger application where the frontend had to communicate with several independent backend services.

One of the main challenges was keeping the different features consistent within the same interface while also handling data coming from separate APIs. Working on the React frontend helped me improve my understanding of component design, application state, API integration and organising a larger user interface.

I also gained more experience working with MongoDB, containerised services and Docker Compose. Seeing the frontend, backend services and database work together helped me understand how different parts of a full-stack application communicate with each other.

## License

This project is shared for educational and demonstration purposes.
