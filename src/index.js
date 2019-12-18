// let's go!
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({
  path: 'variables.env'
});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// Todo express middleware to handle cookies (JWT)
server.express.use(cookieParser());

//decode jwt
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the usr id onto the req to access
    req.userId = userId;
  }
  next();
});

// create a middleware that populate the user on each request
server.express.use(async (req, res, next) => {
  if (!req.userId) return next();
  const user = await db.query.user(
    {
      where: {
        id: req.userId
      }
    },
    '{id, permissions, email, name}'
  );
  req.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`server is running on port http://localhost:${deets.port}`);
  }
);
