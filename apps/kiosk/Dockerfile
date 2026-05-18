FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

ARG VITE_BACKEND_MODE=http
ARG VITE_SEARCH_WEBHOOK_URL=/webhook/search
ARG VITE_PRINT_WEBHOOK_URL=/webhook/print
ARG VITE_KIOSK_AUTH_HEADER=X-Nirvana-Kiosk-Key

ENV VITE_BACKEND_MODE=$VITE_BACKEND_MODE
ENV VITE_SEARCH_WEBHOOK_URL=$VITE_SEARCH_WEBHOOK_URL
ENV VITE_PRINT_WEBHOOK_URL=$VITE_PRINT_WEBHOOK_URL
ENV VITE_KIOSK_AUTH_HEADER=$VITE_KIOSK_AUTH_HEADER

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
