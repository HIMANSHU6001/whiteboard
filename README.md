# Real-Time Collaborative Whiteboard

This repository contains a real-time collaborative whiteboard application. The project is containerized using Docker for easy setup and deployment.

---

## Features
- Real-time collaboration using WebSockets.
- Interactive drawing interface.
- Scalable backend with Node.js.

---

## Prerequisites
Make sure the following are installed on your system:
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (version >= 14)

---

## Quick Start

### Clone the Repository
```bash
git clone https://github.com/HIMANSHU6001/whiteboard.git
cd whiteboard
```

### Set up the backend
```bash
cd server
npm install
docker-compose up -d
```

### Set up the frontend
```bash
cd client
npm install
docker-compose up -d
```
### Start the dev server
```bash
cd server
npm run dev
```

### Start the frontend
```bash
cd client
npm run dev
```

