# SkooBeeDoo
# 📌 **Deployment Link**
- https://skoo-bee-doo.vercel.app/
# Local Setup Instructions

- **Install Dependencies**

  - **Node.js and npm**
    - **Option 1: Install via Package Manager**
      - **Check Installation:**
        - Run: `node --version`
        - Run: `npm --version`
      - **If Node.js is not installed:**
        - **macOS (using Homebrew):**
          - Run: `brew install node`
        - **Ubuntu/Debian:**
          - Run:
            - `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -`
            - Then: `sudo apt install -y nodejs`
        - **Windows:**
          - Download and install from: [Node.js Downloads](https://nodejs.org/)
    - **Option 2: Install via nvm (Node Version Manager)**
      - **Install nvm:**
        - **macOS/Linux:**
          - Run: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`
          - Then, restart your terminal or run: `source ~/.nvm/nvm.sh`
        - **Windows:**
          - Download and install nvm-windows from: [nvm-windows Releases](https://github.com/coreybutler/nvm-windows/releases)
      - **Install the Latest Node.js Version Using nvm:**
        - Run: `nvm install node`
      - **Use the Installed Node.js Version:**
        - Run: `nvm use node`

- **Clone the Repository**

  - Run: `git clone https://github.com/ryanvo504/SkooBeeDoo.git`

- **Navigate to Project Directory**

  - Run: `cd SkooBeeDoo`

- **Set Up Environment Variables**

  - Copy env templates:
    - `cp .env-template backend/.env`
    - `cp .env-frontend-template frontend/.env`
    - Fill in the values in the `.env` file
    - PORT is for the backend server.
    - For the frontend .env file, make sure that variable names are prefixed with `REACT_APP_` for example `REACT_APP_BACKEND_SERVER_PORT=5001`
      - To use your own Firebase for local testing, navigate to the **Firebase Console** and add a new Web app to your project. Then, use the provided config variables for your Firebase setup. Also need to enable Authentication with Google and Email/Password on Firebase Console.

- **Follow README in backend folder to set up Firebase**
  
- **Navigate to the Backend Directory**
-  Run: `cd backend`

-  **Start Backend Server**
-  Run: 'npm run dev'

- **Navigate to the Frontend Directory**

  - Run: `cd frontend`

- **Install Frontend Dependencies**

  - Run: `npm install`

- **Start the Development Server**
  - Run: `npm start`

## Database Setup

- Follow the instructions provided in the README located in the `backend/config` folder.
