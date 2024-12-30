# Quickstart

To quickly get started, run the server as a Docker Container :fontawesome-brands-docker: on your machine or remote Virtual Machine. Follow the instructions below to run the server.

!!! note
    Please note that this project has been exclusively tested on Mac and Linux only. For now, we do not support Windows.

You can run the server locally or on a Virtual Machine and make clients call 
```shell title="Running the Server"
docker run -dp 5002:5002 mockai:latest
```

This will start the server on port 5002 running as a Docker container in the detached mode. To run the server on some other port, you can change the port number in the command above by passing an enviornment variable `SERVER_PORT`.

```shell title="Running the Server on a different port"
docker run -dp 5003:5003 -e SERVER_PORT=5003 mockai:latest
``` 

!!! warning
    This is meant to be a quickstart guide. For production setus, refer to the [Installation](Installation.md) section on how to do production grade installations as well as when to use which.
