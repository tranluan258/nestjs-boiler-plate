FROM node:18.16-alpine3.16
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY . .
# Expose port 3000
EXPOSE 3000
# Build and run the app
RUN npm run build
#Set environment variables
ENV NODE_ENV=production
CMD [ "node", "dist/src/main.js" ]
