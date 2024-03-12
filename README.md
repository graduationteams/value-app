# Value App


## Pre-requisites
- [Node.js](https://nodejs.org/en/)
- [Docker](https://docs.docker.com/engine/install/)

## Installation
1. Clone the repository
2. Install the dependencies
```bash
npm install
```
```bash
npm install -g prisma
```

3. start the database using [docker](https://docs.docker.com/engine/install/)
```bash
docker run --name value-app-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=value-app -d -p 5432:5432 docker.io/postgres
```
4. create .env file in the root of the project and add the following
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/value-app"
GOOGLE_CLIENT_ID="354269438319-0cbp494k0k8bpni739m81lbh05sv1od3.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
NEXTAUTH_SECRET="Pa17nNbqBHmxHUujDxFe5c1wGLTEA2isjDSGFOjz0T8="
NEXTAUTH_URL="http://localhost:3000"
IMGBB_API_KEY="81c3dfe81e04895bc6e8be7460e46166"
NEXT_PUBLIC_MAPBOX_API_TOKEN="pk.eyJ1IjoibmFzZXIxMjMiLCJhIjoiY2xoNnRyenV0MDlsdDNtcWo5dmh5bHVibSJ9.KHjE4n9wqAVKTdIfLqlgNw"
```
5. run prisma push to create the database schema
```bash
npm run db:push
```
6. run the application
```bash
npm run dev
```
7. open the application in the browser at [http://localhost:3000](http://localhost:3000)