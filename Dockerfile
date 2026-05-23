# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_SITE_NAME
ARG VITE_I18N_SUPPORTED_LANGS
ARG VITE_I18N_DEFAULT_LANG
ARG VITE_ENVIRONMENT_MODE

ENV VITE_SITE_NAME=$VITE_SITE_NAME
ENV VITE_I18N_SUPPORTED_LANGS=$VITE_I18N_SUPPORTED_LANGS
ENV VITE_I18N_DEFAULT_LANG=$VITE_I18N_DEFAULT_LANG
ENV VITE_ENVIRONMENT_MODE=$VITE_ENVIRONMENT_MODE

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ─── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
