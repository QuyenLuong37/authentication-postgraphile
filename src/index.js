const express = require("express");
const { postgraphile } = require("postgraphile");
const app = express();
const admin = require('firebase-admin');
const cors = require("cors");
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



app.use(
  postgraphile('postgres://postgres:admin@localhost:5432/awread_app', "public", {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    jwtSecret: 'ahihi',
    jwtPgTypeIdentifier: "public.jwt_token",
    enableCors: true,
    retryOnInitFail: true,
    // pgDefaultRole: 'anonymous',
    // jwtVerifyOptions: {algorithms: ['HS256', 'RS256']},
    pgSettings: async (req) => {
      const token = req.headers.authorization.split('Bearer ')[1];
      console.log('token', token);
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('decodedToken', decodedToken);
      return {
        'role': 'anonymous',
        'jwt.claims.user_id': decodedToken.uid
      };
    }
    
  })
);

app.listen(4000, () => {
  console.log("listening on port", 4000);
});
