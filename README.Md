jwtSecret=superSecretRandom

// lenh ket noi db
postgraphile -c "postgres://postgres:admin@localhost:5432" --watch --show-error-stack --jwt-token-identifier public.jwt_token --jwt-secret superSecretRandom --default-role anonymous

//ket noi cloud sql
gcloud sql connect awread-test --user=postgres --quiet
// check log
gcloud app logs tail -s default

pgAdmin: HS256
firebase: RS256