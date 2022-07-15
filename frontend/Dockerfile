FROM node:16-buster-slim

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Copy app files to /app
COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
