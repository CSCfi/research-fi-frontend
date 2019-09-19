# Research.fi Angular frontend
## Environment setup
### Local development version: add configuration file environment.researchfi.ts
Configuration file **src/environments/environment.researchfi.ts** must be manually added:
* Copy file **environment.ts** and rename it as **environment.researchfi.ts**
* Modify file contents by replacing **http://<API_HOST>** with the correct API server address
### Production version: add configuration file environment.researchfi.prod.ts
Configuration file **src/environments/environment.researchfi.prod.ts** must be manually added:
* Copy file **environment.prod.ts** and rename it as **environment.researchfi.prod.ts**
* Modify file contents by replacing **http://<API_HOST>** with the correct API server address

## Local development without Docker
* Install Node.js and npm package manager, then
```
npm install
ng serve
```

## Local development using Docker
* Install Docker Desktop, then
```
docker-compose up --build
```

## Run different language builds
* For English
```
npm run start-en
```
* For Swedish
```
npm run start-se
```