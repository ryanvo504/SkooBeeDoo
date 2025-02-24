# SkooBeeDoo
# 📌 **Deployment Link**
- https://skoo-bee-doo.vercel.app/
- 
# Local Setup Instructions

- **Clone the Repository**

  - Run: `git clone https://github.com/ryanvo504/SkooBeeDoo.git`

- **Navigate to Project Directory**

  - Run: `cd SkooBeeDoo`

- **Install Dependencies**

- **Set Up Environment Variables**

  - Copy env templates:
    - `cp .env-frontend-template frontend/.env`
    - Fill in the values in the `.env` file
    - PORT is for the backend server.
    - For the frontend .env file, make sure that variable names are prefixed with `REACT_APP_` for example `REACT_APP_BACKEND_SERVER_PORT=5000`
  
- **Navigate to the Backend Directory**
-  Run: `cd pyBackend`

-  **Start Backend Server**
-  Run: `pip install -r requirements.txt`
-  Run: `python main.py`

- **Navigate to the Frontend Directory**

  - Run: `cd frontend`

- **Install Frontend Dependencies**

  - Run: `npm install`

- **Start the Development Server**
  - Run: `npm start`


