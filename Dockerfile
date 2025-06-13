FROM node:18-alpine

# Set working directory
WORKDIR /server

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

# Jalankan aplikasi menggunakan script dari package.json
CMD ["npm", "start"]

