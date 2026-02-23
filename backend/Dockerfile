FROM node:20-alpine

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Create uploads directory
RUN mkdir -p uploads logs

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
