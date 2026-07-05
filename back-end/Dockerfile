# ---- Étape build ----
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Étape runtime (image légère, deps de prod uniquement) ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# main.ts crée le dossier uploads au démarrage si absent
EXPOSE 8080
CMD ["node", "dist/main"]
