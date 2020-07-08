FROM node:latest

WORKDIR /app

COPY dist/. ./dist/

COPY node_modules ./node_modules/

CMD ["node", "--max-http-header-size=50000","--max-old-space-size=8192", "dist/app.js"]
