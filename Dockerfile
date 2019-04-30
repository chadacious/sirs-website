FROM node:9 as builder
ARG NPM_TOKEN

WORKDIR /app
# Use a multi-stage build docker file to first create an environment to build 
# the react application. Note that only the last FROM will create the final docker image
COPY package.json package-lock.json README.md .env.production ./
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
    npm install
# consider using a .dockerignore file here instead of explicitly copying things
COPY /src src
COPY /public public
RUN npm run build
# RUN dir /app
# RUN dir /app/build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.13.9-alpine
COPY --from=builder /app/build /usr/share/nginx/html/sirs
# RUN ls /usr/share/nginx/html
EXPOSE 80
ENV NODE_ENV production
CMD ["nginx", "-g", "daemon off;"]
