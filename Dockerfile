FROM alpine as builder

ARG PB_VERSION=0.25.1
ARG PB_PLATFORM=arm64

RUN apk add --no-cache \
    unzip \
    ca-certificates

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_PLATFORM}.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/


FROM node:lts-alpine as builder-front

ENV PUBLIC_POCKETBASE_URL="/"
COPY front /front
WORKDIR /front
RUN npm i
RUN npm run build

FROM alpine

RUN mkdir /pb
COPY --from=builder-front /front/build /pb/pb_public
COPY --from=builder /pb/pocketbase /pb/pocketbase
COPY ./back/pb_migrations /pb/pb_migrations
COPY ./back/pb_hooks /pb/pb_hooks

ENTRYPOINT ["/pb/pocketbase", "serve"]
CMD ["--http=0.0.0.0:8090"]