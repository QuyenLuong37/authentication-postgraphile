const express = require("express");
const { postgraphile } = require("postgraphile");
const app = express();
const admin = require('firebase-admin');
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

// var jwt = require('jsonwebtoken');
app.use(cors());

var firebaseConfig = {
  apiKey: "AIzaSyDonsfTedgMB9WkG6M9eqXg0PsL57MZ_1A",
  authDomain: "quyenluong-f73b6.firebaseapp.com",
  databaseURL: "https://quyenluong-f73b6.firebaseio.com",
  projectId: "quyenluong-f73b6",
  storageBucket: "quyenluong-f73b6.appspot.com",
  messagingSenderId: "81490128796",
  appId: "1:81490128796:web:ffd5e6f72b60ad7264a259",
  measurementId: "G-D17G8NEV6X"
};

admin.initializeApp(firebaseConfig);

// const pgConfig = {
//   host: process.env.PGHOST || "localhost",
//   port: process.env.PGPORT || 5432,
//   user: process.env.PGUSER,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
// };

// Enable CORS
app.use(cors());

// Enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

const checkJwt = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      console.log('no token found');
      next();
    } else {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req['user'] = decodedToken;
      next();
    }
  } catch (error) {
    res.status(401).send(error);
  }
}


app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.get('/master', asyncMiddleware(checkJwt), (req, res) => {
  const userData = req.user;
  console.log('userData', userData);
  res.send({
    message: 'master here',
    user: userData
  });
});


app.use("/graphql", asyncMiddleware(checkJwt));

app.use(
  postgraphile('postgres://postgres:admin@localhost:5432/awread_app', "public", {
    pgSettings: async req => {
      const settings = {};
      console.log('req.user', req.user);
      if (req.user) {
        return {
          role: "reader",
          "jwt.claims.user_id": req.user.uid,
        };
      } else {
        console.warn("failed to authenticate, using role default (anonymous)");
        // role null will be using default role of Postgraphile
        return { role: "anonymous" };
      }
    },
    // any other PostGraphile options go here
  })
);

app.listen(3000, () => {
  console.log("listening on port", 3000);
});
