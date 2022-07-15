FROM node:16-buster-slim as build

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY backend/package*.json /app/backend/
COPY frontend/package*.json /app/frontend/

# Install app dependencies
RUN npm --prefix /app/backend ci && npm --prefix /app/frontend ci

# Copy app files to /app
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# Copy nginx config
COPY nginx/default.conf.1 /app/nginx/default.conf

# Set NODE ENV to production
ENV NODE_ENV production

# Build the application
RUN npm --prefix /app/backend run build
RUN npm --prefix /app/frontend run build

# -------------------------------------------------- #

FROM node:16-buster-slim

# Install NGINX and concurrently
RUN apt-get update && apt-get install nginx -yy && npm install -g concurrently

# Copy all the content from the first stage into the final stage
COPY --from=build /app/ /app/

# Copy NGINX configuration file to NGINX directory
COPY --from=build /app/nginx/default.conf /etc/nginx/sites-enabled/default

# Expose the ports
EXPOSE 80

# Run the backend server and NGINX server concurrently
CMD ["concurrently", "'npm --prefix /app/backend run start'", "'npm --prefix /app/frontend run start'", "'nginx -g 'daemon off;''"]
