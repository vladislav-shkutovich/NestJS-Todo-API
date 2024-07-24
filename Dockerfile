# Node version variable for easy updates
ARG NODE_VERSION=20.13.1

# Build stage for the application
FROM node:${NODE_VERSION} AS builder

# Setting the working directory in the container
WORKDIR /app

# Copying dependency management files
COPY package.json yarn.lock ./

# Installing dependencies with the exact versions from lockfile
RUN yarn install --frozen-lockfile && yarn global add @nestjs/cli

# Copying the source code of the project
COPY . .

# Running the build script
RUN yarn build

# Final stage based on the lighter Node Alpine image
FROM node:${NODE_VERSION}-alpine

# Setting the work directory
WORKDIR /app

# Copying the built code and dependencies from the previous stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exposing the port used by the application
EXPOSE 3000

# Environment variable for MongoDB connection
ENV MONGODB_URI=${MONGODB_URI}

# Command to run the application
CMD ["yarn", "start:prod"]
