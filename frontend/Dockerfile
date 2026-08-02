# ─── Build Stage ───
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# ─── Production Stage ───
FROM nginx:alpine AS production

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Create SSL directory (certs will be mounted via volume)
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
