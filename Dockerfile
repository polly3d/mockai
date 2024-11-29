FROM node:22-alpine

RUN npm install -g pnpm

COPY . /app
WORKDIR /app
RUN pnpm install

EXPOSE 5002

CMD ["pnpm", "start"]