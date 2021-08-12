FROM node:14.17-alpine3.14 as builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm ci
RUN npm run build

## this is stage two , where the app actually runs
FROM node:14.17-alpine3.14 as runner
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production
RUN npm add -D prisma
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
COPY --chown=node:node .env .

USER node

EXPOSE 5000
CMD [ "node", "dist/server.js" ]