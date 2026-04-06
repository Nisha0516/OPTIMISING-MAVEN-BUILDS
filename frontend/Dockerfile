# Stage 1: Build the React Application
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first for Docker caching
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application using NGINX
FROM nginx:alpine

# Copy the built React artifacts to the NGINX html serving directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
