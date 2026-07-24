# Dev image for the Nimbus API. Installs workspaces deps only
# source is bind mounted by docker-compose for hot reload.

FROM node:22.23.1-slim

# husky prepare script (nimbus/package.json) needs .git, which isn't in the build context. Disable it so `npm ci` doesn't fail
ENV HUSKY=0
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./
COPY nimbus/package.json ./nimbus/package.json 
COPY nimbus/server/package.json ./nimbus/server/package.json 

# Install dependencies
RUN npm ci

EXPOSE 4000

# Run 'tsx watch src/index.ts' in the server workspace
CMD ["npm", "run", "dev", "--workspace", "server"]