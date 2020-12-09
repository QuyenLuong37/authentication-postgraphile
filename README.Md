# INSTALL
```
`npm intall` or `yarn install`
```
# RUNNING
```
nodemon src/server-auth.js
nodemon src/server-firebase.js
```

postgraphile -c "postgres://postgres:admin@localhost:5432" --watch --show-error-stack --jwt-token-identifier public.jwt_token --jwt-secret superSecretRandom --default-role anonymous

