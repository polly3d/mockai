# MockAI

MockAI is a mock server for OpenAI's API. It allows you to simulate API Requests and Responses from LLMs for development and testing purposes.
## Features

- Supports all the OpenAI (more providers coming soon) endpoints:
- Allows you to specify the type of mock response: echo, random, or fixed.
- Supports both single responses and streaming responses.
- Reads random responses from a text file.
- Run the Server as a Github Action in your CI workflows for integration testing
- Exposes Structured Logging and Prometheus Metrics for monitoring the server

## Why MockAI?

Let's be real! AI is still pretty expensive :fontawesome-solid-sack-dollar:. With the footprint of AI applications and adoption increasing in enterprises, testing these applications and clients becomes more and more expensive. Suddenly, running unit tests and frequent deployments becomes prohibitively expensive. MockAI is a way to mock the responses from the LLMs and test your application without incurring any costs.
