# ---------- Stage 1: Build ----------
FROM node:20 AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build


# ---------- Stage 2: Production ----------
  
FROM node:20-slim

# Create non-root user for security (named after project)
RUN addgroup --system issue_tracker_group \ 
  && adduser --system --ingroup issue_tracker_group issue_user

WORKDIR /app

# Copy only necessary package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Give ownership of files to non-root user
RUN chown -R issue_user:issue_tracker_group /app

# Switch to secure non-root user
USER issue_user

# Expose backend port
EXPOSE 3000

# Healthcheck using friendly /health endpoint
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider -q http://localhost:3000/health || exit 1

# Start compiled server
CMD ["node", "dist/app.js"]