FROM node:16-buster-slim AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Copy app files to /app
COPY . .

RUN npm run build

# -------------------------------------------------- #

FROM node:16-buster-slim AS backend

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 9000

CMD [ "npm", "run", "start:prod" ]
