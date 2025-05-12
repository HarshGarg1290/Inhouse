import app from '../server.js';
import serverless from 'serverless-http';

// Export the serverless handler
export default serverless(app);
