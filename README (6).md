# Student Companion App

Student Companion is a full-stack web application designed to bring useful student tools into one place.

I worked mainly on developing the frontend as a React single-page application, building the main interface and connecting the different features into one consistent experience. I also worked with the backend APIs and service integration so the frontend could store and retrieve data through MongoDB.

## Features

- user registration and login
- expense tracking with spending visualisations
- planner and event management
- wellbeing and mood tracking
- personal diary
- community feed with posts and comments
- profile management
- persistent MongoDB data storage

## Technologies Used

- React
- JavaScript
- Vite
- Node.js
- Express
- MongoDB
- REST APIs
- Docker
- Docker Compose
- Nginx

## Project Structure

```text
student-companion-app/
├── frontend/
├── services/
│   ├── auth-service/
│   ├── expense-service/
│   ├── feed-service/
│   └── profile-service/
├── images/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── render.yaml
├── start-services.ps1
├── stop-services.ps1
├── LICENSE
└── README.md
```

## Application Screenshots

### Dashboard

![Student Companion dashboard](images/dashboard.png)

### Expense Tracking

![Expense tracking](images/expenses-history.png)

### Events Calendar

![Events calendar](images/events-calendar.png)

### Wellbeing

![Wellbeing tracker](images/wellbeing.png)

### Community Feed

![Community feed](images/community-feed.png)

## Running the Application

Make sure Docker is installed and running.

Clone the repository and open the project folder:

```bash
git clone <your-repository-url>
cd student-companion-app
```

Create a local `.env` file using `.env.example` and add the required email credentials.

Start the application:

```bash
docker compose up --build
```

The application runs the React frontend, MongoDB and the backend services together using Docker Compose.

To stop the application:

```bash
docker compose down
```

## What I Learned

This project gave me practical experience building a larger React application and connecting one frontend with multiple backend services. I improved my understanding of reusable components, application state, API integration and keeping the user interface consistent across different features.

I also gained experience working with MongoDB, REST APIs and Docker Compose, which helped me understand how the frontend, backend services and database work together in a full-stack application.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
