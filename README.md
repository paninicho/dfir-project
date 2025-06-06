# Cyber Security Learning Platform

This repository contains a minimal demo for a cyber security education platform similar to TryHackMe.

## Backend

Located in the `backend` directory. It uses Node.js with Express and stores path/module/task data in a JSON file.

### Running

```bash
cd backend
npm install
npm start # starts the server on port 3001
```

### Testing

```bash
npm test
```

## Frontend

A very small static frontend is under `frontend`. Simply open `frontend/index.html` in a browser while the backend server is running.

When answering quizzes you earn points. Clicking the **Hint** button reveals a hint but reduces the points awarded for a correct answer.
