# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

RUN npm run build

# Runtime stage
FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV BACKEND_URL=http://localhost:8080

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
