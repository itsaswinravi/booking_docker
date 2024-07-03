# set the base image to create the image for the Node.js app
FROM node:20-alpine

# create a user with permissions to run the app
RUN addgroup -S app && adduser -S -G app app

# set the user to run the app
USER app

# set the working directory to /app
WORKDIR /app

# copy package.json and package-lock.json to the working directory
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the application code
COPY . .

# expose the port on which the app runs
EXPOSE 5173

# start the application
CMD node index.js
