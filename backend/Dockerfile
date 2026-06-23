FROM node:22-alpine

WORKDIR /app

COPY tsconfig.base.json ./tsconfig.base.json
COPY backend/package*.json ./backend/

WORKDIR /app/backend

RUN npm install

COPY backend ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]