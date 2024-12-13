FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install pnpm -g && pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm run build && pnpm prune --prod --ignore-scripts

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
