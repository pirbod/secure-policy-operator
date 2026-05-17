FROM golang:1.21 AS build

WORKDIR /workspace
COPY operator/go.mod ./
RUN go mod download

COPY operator ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /manager ./main.go

FROM gcr.io/distroless/static:nonroot

WORKDIR /
COPY --from=build /manager /manager
USER 65532:65532

ENTRYPOINT ["/manager"]
