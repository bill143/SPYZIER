# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

RUN addgroup -S spyzier && adduser -S spyzier -G spyzier

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN chown -R spyzier:spyzier /usr/share/nginx/html && \
    chown -R spyzier:spyzier /var/cache/nginx && \
    chown -R spyzier:spyzier /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown spyzier:spyzier /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
