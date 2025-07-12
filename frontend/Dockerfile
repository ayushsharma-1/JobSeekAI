# Build stage
FROM node:18 AS builder
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
# FROM node:18-slim
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY package.json package-lock.json ./
# RUN npm install --production
# CMD ["npx", "serve", "-s", "dist", "-l", "3000"]