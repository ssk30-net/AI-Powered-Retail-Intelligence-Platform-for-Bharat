FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle version conflicts
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only with legacy peer deps
RUN npm ci --production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
