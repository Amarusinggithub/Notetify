# Notetify

Notetify is a sleek and modern full-stack document editing note-taking application inspired by Google docs and evernote, designed to help you easily organize your thoughts, tasks, and plans. It supports tagging, archiving, and pinning, favoriting notes, along with powerful real-time collaboration features that allow users to share and work together on documents simultaneously. Built with a React frontend and a Django backend, it ensures both a responsive user experience and robust backend performance.

---

## Features

- **Create and manage notes** with ease
- **Pin important notes** for quick access
- **Use custom tags** to categorize notes
- **Archive or delete** notes when no longer needed
- **Modern UI** with dark theme for comfort
- **Real-time collaboration**: Share notes and collaborate with others in real time

---

## Project Structure

```
Notetify/
├── backend/            # Python Django API
├── frontend/           # React frontend (Vite)
├── compose.yaml        # Docker Compose configuration (optional)
├── .env.example        # Environment variable example
├── README.md           # Project README
```

---

## Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v18 or later) & **npm**\
  [https://nodejs.org/](https://nodejs.org/)
- **Python** (3.10 or later)\
  [https://www.python.org/downloads/](https://www.python.org/downloads/)
- **pip** (Python package installer)\
  [https://pip.pypa.io/en/stable/](https://pip.pypa.io/en/stable/)
- (Optional) **Docker & Docker Compose**

---

## How to Clone & Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/Amarusinggithub/Notetify.git
cd Notetify
```

### 2. Setup Backend (Django)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
 uvicorn backend.asgi:application  
```

The backend server will run at: `http://localhost:8000`

### 3. Setup Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at: `http://localhost:5173`

---

## Screenshot

Here is a preview of the Notetify UI in action:

![Notetify UI](./screenshots/notetify_ui.png)
---

## Environment Variables

Copy the `.env.example` file and create a new `.env` file in both the `backend` , `frontend` and  base  directories. Update them with your local configurations.

---

## Run Redis In Docker

```bash
docker run -d --name redis-notetify  -p 6379:6379 --rm redis:8.0.1-alpine
```

## copy redis docker id

```bash
docker ps
```

Here is how to copy id:

![Copy Redis Id](./screenshots/redis_container_id.png)

Then enter redis container terminal by:

```bash
docker exec -ti <yourRedisContainerId> bash
```

![Enter container terminal](./screenshots/enter_redis_container_terminal.png)


---

## Optional: Run with Docker Compose

```bash
docker compose up --build
```

```bash
docker-compose -f docker-compose.dev.yaml up --build
```

```bash
docker-compose -f docker-compose.prod.yaml up --build
```

---
