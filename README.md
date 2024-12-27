# MockAI

MockAI is a mock server for OpenAI's API. It allows you to simulate API responses for development and testing purposes.

## Features

- Supports all the OpenAI (more providers coming soon) endpoints:
- Allows you to specify the type of mock response: echo, random, or fixed.
- Supports both single responses and streaming responses.
- Reads random responses from a text file.

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set env

Open .env file and set your environment.

```bash
SERVER_PORT=5002
MOCK_TYPE=random
MOCK_FILE_PATH=data/contents.txt
MOCK_FILE_SEPARATOR="@@@@"
```

3. Start server:

```bash
pnpm start
```

## Environment Variables

- **SERVER_PORT**: The port the server listens on.
- **DEFAULT_MOCK_TYPE**: The default type of mock response.
- **MOCK_FILE_PATH**: The path to the text file of random responses.
- **MOCK_FILE_SEPARATOR**: Random contents separator. As there may be instances of line breaks or code outputs, it is not advisable to separate with line breaks.
- **RESPONSE_DELAY_MS**: Delays Response by time in milliseconds
- **REQUEST_SIZE_LIMIT**: Max Permissible Payload Size. Default is 10kb.
## Custom Header
- `x-set-response-delay-ms` header can be sent from the client to delay the response by that time (Takes precedence over the enviornment variable RESPONSE_DELAY_MS).

## Contributing

Contributions are welcome! Please submit a pull request or create an issue to get started.
