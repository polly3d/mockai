# MockAI

MockAI is a mock server for OpenAI's API. It allows you to simulate API responses for development and testing purposes.

## Features

- Supports the `/v1/chat/completions` endpoint.
- Allows you to specify the type of mock response: echo, random, or fixed.
- Supports both single responses and streaming responses.
- Reads random responses from a text file.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start server:

```bash
npm start
```

## Environment Variables

- **SERVER_PORT**: The port the server listens on.
- **DEFAULT_MOCK_TYPE**: The default type of mock response.
- **MOCK_FILE_PATH**: The path to the text file of random responses.

## Contributing

Contributions are welcome! Please submit a pull request or create an issue to get started.
