# Mailbird Challenge

This project is developed using ```Node.js v16.15.0``` and it consists of two parts:

## Frontend

The frontend was mainly built with:

- [Next.js](https://nextjs.org/) as the framework.
- [TailwindCSS](https://tailwindcss.com/) for styling.
- [TypeScript](https://www.typescriptlang.org/) for coding.

With the help of the following libraries:

- [HeadlessUI](https://headlessui.com/) for quicker prototyping with TailwindCSS.
- [react-hook-form](https://react-hook-form.com/) for form submission/validation.
- [react-icons](https://react-icons.github.io/react-icons/) for icons.
- [react-letter](https://www.npmjs.com/package/react-letter) for email preview.
- [react-timeago](https://www.npmjs.com/package/react-timeago) for date formatting.

## Backend

The backend was mainly built with:

- [Nest.js](https://nestjs.com/) as the framework.
- [TypeScript](https://www.typescriptlang.org/) for coding.

With the help of the following libraries:

- [mailparser](https://www.npmjs.com/package/mailparser) for parsing emails.
- [imap](https://www.npmjs.com/package/imap) for connecting with IMAP servers.
- [mailpop3](https://www.npmjs.com/package/mailpop3) for connecting with POP3 servers.
- [p-event](https://www.npmjs.com/package/p-event) for handling mailpop3 events as promisses.
- [express-session](https://www.npmjs.com/package/express-session) for session management.

# How to run?

The application is available in both docker and docker compose.

## Docker image

To run the application using docker you will need to pull the image first from docker hub by running the following command:

```bash
$ docker pull reversablecode/mailbird-challenge:latest
```

And then run the following command to run a container that can be accessed through ```localhost:80```

```bash
$ docker run -p 80:80 reversablecode/mailbird-challenge:latest
```

**NOTE:** You can change the port where you can access the application by changing the first part of the port mapping as seen here ```<your-local-machine-port>:80```. Make sure that the port on your local machine is not being used beforehand.

**NOTE:** The container can also take the session secret via environment variables as follows:

```bash
$ docker run -p 80:80 --env SESSION_SECRET=<your-secret> reversablecode/mailbird-challenge:latest
```

## Docker compose

Both the frontend and backend are built into their own docker images and can be run along side Nginx with the help of the ```docker-compose.yml```

```yml
version: "3.8"

services:
  backend:
    image: reversablecode/mailbird-challenge-backend:latest
    ports:
      - "9000:9000"
    restart: always
    environment:
      - SESSION_SECRET=${SESSION_SECRET}

  frontend:
    image: reversablecode/mailbird-challenge-frontend:latest
    ports:
      - "3000:3000"
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=/api

  nginx:
    image: nginx:latest
    volumes:
      - ./nginx:/etc/nginx/conf.d
    ports:
      - "80:80"
    depends_on:
      - frontend
      - backend
    restart: always
```

```./nginx/default.conf``` file

```nginx
upstream frontend_upstream {
  server frontend:3000;
}

upstream backend_upstream {
  server backend:9000;
}

server {
  listen 80 default_server;

  server_name _;

  server_tokens off;

  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;

  location / {
    proxy_pass http://frontend_upstream;
  }

  location /api {
    proxy_pass http://backend_upstream;
  }
}
```
Here is the folder structure

```
mailbird-challenge/
  ├─ nginx/
  │    ├─ default.conf
  ├─ docker-compose.yml
```
## Running the app

The application can be run with a single command of docker compose inside the folder containing ```docker-compose.yml```

```bash
$ docker-compose up
```

The application should be running at ```localhost:80```

**NOTE:** You can change the port inside the ```docker-compose.yml``` at the part ```"80:80"``` where the first number represents the port on your local machine and the second one for the port inside the container. Make sure that the port on your local machine is not being used beforehand.

# Testing

During the developement, I used Gmail's IMAP/POP3 servers to test the project with the help of the [following article from Google support](https://support.google.com/mail/answer/7126229?hl=en#zippy=%2Cstep-check-that-imap-is-turned-on%2Cstep-change-smtp-other-settings-in-your-email-client).

The docker version used during the developement is ```version 20.10.12, build e91ed57```
