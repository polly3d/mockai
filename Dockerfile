FROM node:22-alpine

COPY . /app
WORKDIR /app
RUN npm install

CMD ["npm", "start"]