const express = require("express");
const { postgraphile } = require("postgraphile");

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
const bodyParser = require("body-parser");

// ...

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://hiepxanh.auth0.com/.well-known/jwks.json`,
    }),
    audience: "https://hiepxanh.auth0.com/api/v2/",
    issuer: `https://hiepxanh.auth0.com/`,
    algorithms: ["RS256"],
});

const app = express();

// Enable CORS
app.use(cors());

// Enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.send('Hello World!!!')
})

app.get('/master', checkJwt, (req, res) => {
    const userData = req.user;
    console.log('userData', userData);
    res.send({
        message: 'master here',
        user: userData
    });
});
// Apply checkJwt to our graphql endpoint
app.use("/graphql", checkJwt);

app.use(
    // postgraphile(process.env.DATABASE_URL, process.env.DB_SCHEMA, {
    postgraphile('postgres://postgres:admin@localhost:5432/awread_app', "public", {
        pgSettings: req => {
            const settings = {};
            console.log('req', req);
            if (req.user) {
                settings["role"] = "reader";
                settings["user_id"] = req.user.sub;
                return {
                    role: "reader",
                    "jwt.claims.user_id": req.user.sub,
                };
            } else {
                console.warn("failed to authenticate");
                return { role: "todo_anonymous" };
            }
        },
        // any other PostGraphile options go here
    })
);

app.listen(3000, () => {
    console.log("listening on port", 3000);
});