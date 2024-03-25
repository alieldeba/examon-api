FROM node:18
RUN corepack enable
RUN corepack prepare pnpm@8.10.5 --activate

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm prisma generate

RUN pnpm build

CMD [ "pnpm", "start:dev" ]
