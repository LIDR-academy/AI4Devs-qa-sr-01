/opt/homebrew/opt/postgresql@15/bin/psql -d LTIdb

Ver usuario existentes
/opt/homebrew/opt/postgresql@15/bin/psql -d LTIdb -c "\du"

Borrar un usuario anterior
/opt/homebrew/opt/postgresql@15/bin/dropuser LTIdbUser

Crear nuevo usuario
/opt/homebrew/opt/postgresql@15/bin/createuser -s ltidbuser

Cerrar
\q

Probar conexion
/opt/homebrew/opt/postgresql@15/bin/psql postgresql://ltidbuser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb


cd backend

# Generar cliente
npm run prisma:generate

# Aplicar schema
npx prisma db push

# Ejecutar seed
npm run prisma:seed


http://localhost:3010/positions/1/candidates
http://localhost:3010/positions/1/interviewFlow


