<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# TesloDB API

1.- Clone project

2.- ```yarn install```

3.- Clone file ```.env.template``` and rename to ```.env```

4.- Change enviroment variables

5.- Get up database
```
docker-compose up -d
```

6.- Seed Execute
```
GET http://localhost:3000/api/seed
```

7.- Get up service: 
```
yarn start:dev
```