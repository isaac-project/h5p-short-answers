FROM node:alpine as build
WORKDIR /app
ADD . /app
RUN npm install
RUN npm run build

FROM sr258/drupal-h5p-docker
RUN mkdir -p /var/www/html/sites/default/files/h5p/libraries/H5P.ShortAnswers
WORKDIR /var/www/html/sites/default/files/h5p/libraries/H5P.ShortAnswers
COPY --from=build /app/library.json ./
COPY --from=build /app/semantics.json ./
COPY --from=build /app/dist ./dist


