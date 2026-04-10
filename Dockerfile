# build
FROM node:18-alpine AS build
WORKDIR /app
COPY app/ .
ARG APP_VERSION=dev
ENV REACT_APP_VERSION=$APP_VERSION
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80