const express = require("express");
const { postgraphile } = require("postgraphile");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const admin = require('firebase-admin');
app.use(cors());
// Enable the use of request body parsing middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));

const firebaseConfig = require('./adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: "https://awready-beta.firebaseio.com"
});

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


app.use("/graphql", asyncMiddleware(checkJwt));

app.use(
  postgraphile('postgres://postgres:admin@localhost:5432/awread_app', "public", {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    pgSettings: async req => {
      console.log('req.user', req.user);
      return checkRole(req);
    },
  })
);

function checkRole(req) {
  if (req.user) {
    if (req.user.role === 'mod') {
      console.log("role is admin");
      return {
        role: "admin",
        "jwt.claims.user_id": req.user.uid
      }
    }
    
    console.log("role is writer");
    return {
      role: "writer",
      "jwt.claims.user_id": req.user.uid
      // req.user.uid,
    };
  } else {
    console.warn("failed to authenticate, using role default (anonymous)");
    // role null will be using default role of Postgraphile
    return { 
      role: "anonymous",
      "jwt.claims.user_id": '0bde81a0-0b3a-4c14-a5e7-f79d61b3eff8'
    };
  }
}

app.post('/setCustomClaims', (req, res) => {
  // Get the ID token passed.
  const idToken = req.body.idToken;
  // Verify the ID token and decode its payload.
  admin.auth().verifyIdToken(idToken).then((claims) => {
    // Verify user is eligible for additional privileges.
    // &&
    // claims.email.endsWith('@admin.example.com')
    console.log("claims", claims);
    if (typeof claims.email !== 'undefined' &&
        typeof claims.email_verified !== 'undefined' ) {
          try {
            admin.auth().setCustomUserClaims(claims.sub, {
              role: 'mod'
            }).then(function() {
              // Tell client to refresh token on user.
              res.end(JSON.stringify({
                status: 'success'
              }));
            });
          } catch (error) {
            res.send(`error: ${JSON.stringify(error)}`);
          }
      // Add custom claims for additional privileges.
      
    } else {
      // Return nothing.
      res.end(JSON.stringify({status: 'ineligible'}));
    }
  });
});

app.listen(4000, () => {
  console.log("listening on port", 4000);
});
