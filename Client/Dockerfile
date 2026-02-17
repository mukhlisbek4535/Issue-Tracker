# ---------- Stage 1: Build React App ----------
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build production static files
RUN npm run build


# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine


# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# 🔴 CHANGE 2: Cloud Run expects PORT env variable
ENV PORT=8080

# Expose port 8080
EXPOSE 8080

# Healthcheck: verify index.html is served
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider -q http://localhost:8080 || exit 1

CMD ["nginx", "-g", "daemon off;"]