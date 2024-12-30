# Installation

There are many ways to use MockAI. You can use it as a Docker Container :fontawesome-brands-docker:, a Github Action :simple-github:, or a local server :material-server:. Each has its own advantages and disadvantages. In the following sections, we'll talk about how to setup each of these.

## Docker Container

To start the server as a Docker container, all you have to do is run the container with the `restart` flag. This will ensure that the container is always running as long as the Docker Daemon is running.

```shell title="Running the Server"
docker run -dp --restart unless-stopped 5002:5002 mockai:latest
```
This will start the server on port 5002 running as a Docker container in the detached mode. To run the server on some other port, you can change the port number in the command above by passing an enviornment variable `SERVER_PORT`.

```shell title="Running the Server on a different port"
docker run -dp 5003:5003 -e SERVER_PORT=5003 mockai:latest
```

## Local Server
At the end of the day, MockAI is a Node.js application. You can run it as a local server by following the steps below as long as you have Node.js installed on your machine.

!!! info "Supported Versions"
    Please note that this project is tested for these node versions: `18.x`, `20.x`, `22.x`. So ensure you have one of these versions installed.

The steps are as below:

```bash title="Cloning the Repository"
git clone https://github.com/polly3d/mockai.git
```

```bash title="Installing Dependencies"
cd mockai
pnpm install
npm install # Use this if you don't have pnpm installed
```

```bash title="Creating a systemd service"
cd /etc/systemd/service
sudo vim mockai.service
```

```bash title="mockai.service"
[Unit]
Description=MockAI Server
After=network.target

[Service]
User=root
WorkingDirectory=/path/to/mockai
ExecStart=/usr/bin/node /path/to/mockai/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash title="Starting the Service"
sudo systemctl start mockai
sudo systemctl enable mockai
```

This will start the server on port 5002 running as a systemd service. This will also ensure that the server is started on boot and restarted on failure.

## Github Action
Mockai can be run as a Github Action in your CI workflows for integration testing. You can use the [MockAI](https://github.com/marketplace/actions/mockai) action to run the server as a Github Action. This will run the server in the background and your clients can make requests to it.