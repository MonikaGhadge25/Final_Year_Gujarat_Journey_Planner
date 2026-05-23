# Gujarat Journey Planner Final Year Project 

A full-stack travel booking platform for Gujarat tourism.

## Tech Stack
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB

## Setup Instructions

### 1. Clone the repo
git clone https://github.com/MonikaGhadge25/Final_Year_Gujarat_Journey_Planner.git

### 2. Install dependencies
cd backend
npm install

### 3. Create your .env file
Copy .env.example to .env and fill in your values:
cp .env.example .env

### 4. Seed the database
node seed_agents_users.js
node seed_hotel_managers.js

### 5. Start the server
npm start