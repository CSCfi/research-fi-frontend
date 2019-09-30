# Research.fi Angular frontend
## Environment setup
### Local development version: add file config.json
Configuration file **src/assets/config/config.json** must be manually added:
* Copy file **src/assets/config/config_template.json** as **src/assets/config/config.json**.
* Modify file contents by replacing **<API_HOST>** with the correct API server address.
### Production version
Production version of configuration file is added during CI/CD process.

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
npm run start-sv
```