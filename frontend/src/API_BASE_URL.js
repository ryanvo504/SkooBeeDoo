// Load environment variables from the .env file

const BACKEND_SERVER_PORT = process.env.REACT_APP_BACKEND_SERVER_PORT || 3000;
const BACKEND_SERVER_HOST = process.env.REACT_APP_BACKEND_SERVER_HOST|| 'http://localhost';

let FRONTEND_API_BASE_URL;

if (process.env.REACT_APP_NODE_ENV === 'production') {
    FRONTEND_API_BASE_URL = process.env.REACT_APP_BACKEND_SERVER_URL;
} else {
    FRONTEND_API_BASE_URL = "https://skoo-bee-doo.vercel.app/";
}

export default FRONTEND_API_BASE_URL;
