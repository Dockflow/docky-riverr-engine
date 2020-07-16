FROM node:latest

WORKDIR /app

COPY dist/. ./dist/

COPY node_modules ./node_modules/
COPY assets ./assets/

CMD ["node", "--max-http-header-size=50000","--max-old-space-size=8192","--stack_size=1200", "dist/app.js"]
