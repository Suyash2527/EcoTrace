# Base Node image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json if any (not needed strictly here since client/server are separate)
# but we'll copy the whole repo for now
COPY . .

# Build Client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Build Server
WORKDIR /app/server
RUN npm install
RUN npm run build

# Final Production Image
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/

# Install production dependencies for server only
WORKDIR /app/server
RUN npm install --omit=dev

# Expose port (Cloud Run sets PORT env var automatically)
EXPOSE 8080

# Run the server
CMD ["node", "dist/index.js"]
