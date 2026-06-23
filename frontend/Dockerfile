FROM node:22-alpine

WORKDIR /app

COPY tsconfig.base.json ./tsconfig.base.json
COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend

RUN npm install

COPY frontend ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]