# Multi-stage image for the Nimbus API. The dev stage supports hot reload,
# while the runtime stage contains only the files needed in production.

# Shared foundation for dependency installation and application builds.
FROM node:22.23.1-slim AS base

# husky prepare script (nimbus/package.json) needs .git, which isn't in the build context. Disable it so `npm ci` doesn't fail
ENV HUSKY=0

# Use the repository root as the working directory so npm can resolve every workspace.
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./
COPY nimbus/package.json ./nimbus/package.json 
COPY nimbus/server/package.json ./nimbus/server/package.json 

# Install all workspace dependencies, including development tools used by the dev and build stages.
FROM base AS deps

RUN npm ci

# Development image used by docker-compose. Server source is bind mounted for hot reload.
FROM deps AS dev

# Tell Node and its dependencies to use development behavior.
ENV NODE_ENV=development

# Document the port used by the Fastify API.
EXPOSE 4000

# Run 'tsx watch src/index.ts' in the server workspace
CMD ["npm", "run", "dev", "--workspace", "server"]

# Compile the server's TypeScript source into JavaScript for the production image.
FROM deps AS build

# Copy only the server files required by the TypeScript compiler.
COPY nimbus/server/tsconfig.json ./nimbus/server/tsconfig.json
COPY nimbus/server/src ./nimbus/server/src

# Run the server workspace build and write the compiled output to dist.
RUN npm run build --workspace server

# Install only the server dependencies required at runtime, excluding development tools.
FROM base AS prod-deps

RUN npm ci --omit=dev --workspace server --include-workspace-root=false

# Start the final production image from a clean Node base instead of carrying over build tools.
FROM node:22.23.1-slim AS runtime

# Configure Fastify for production and make it reachable outside the container on port 4000.
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

# Restore the same repository-root layout used by the workspace installation.
WORKDIR /app

# Copy production dependencies and assign ownership to the non-root Node user.
COPY --from=prod-deps --chown=node:node /app /app

# Copy only the compiled server output from the temporary build stage.
COPY --from=build --chown=node:node \
  /app/nimbus/server/dist \
  /app/nimbus/server/dist

# Run the production command from the server workspace directory.
WORKDIR /app/nimbus/server

# Reduce container privileges by running the API as the built-in Node user.
USER node

# Document the port exposed by the production API.
EXPOSE 4000

# Start the compiled JavaScript directly without TypeScript or tsx.
CMD ["node", "dist/index.js"]
