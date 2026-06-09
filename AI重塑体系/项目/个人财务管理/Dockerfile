FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm run build:server


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4176
ENV FINANCE_DATA_FILE=/app/data/finance.json

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build/server ./build/server
COPY --from=builder /app/data ./data

EXPOSE 4176

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4176) + '/api/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]
