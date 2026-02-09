# Connect Inspector

> **⚠️ DEPRECATION NOTICE: This tool will be discontinued by the end of February 2026.**
> 
> We are open sourcing this repository so that people can copy it if they want to continue using it. The source code will be available at: http://go.atlassian.com/connect-inspector

To use this tool: http://go.atlassian.com/connect-inspector

The Atlassian Connect inspector allows you to generate temporary add-ons that you can install into you [Cloud Development Environment][1] and use to inspect the:

- Lifecycle events - See what happens when you install, enable, disable and uninstall an add-on.
- Webhook events - See what happens when any of the webhook events fire from the Atlassian Products. Like issue_updated or page_created.

It is hosted for you so you do not need to run or host it yourself. This is a great way to inspect what messages are sent to Atlassian Connect add-ons and what the structure of their payloads will be.

## How to use the connect-inspector

It only takes five simple steps:

1.  Navigate to: http://go.atlassian.com/connect-inspector
1.  Click 'Create temporary add-on' to create a temporary add-on just for you.
1.  Click 'Copy descriptor to clipboard' to copy the URL to your temporary add-ons Atlassian Connect Descriptor.
1.  In a new tab, navigate to your Atlassian Cloud development environment and navigate to the 'Manage add-ons' page.
1.  Click on the 'Upload add-on' button and paste in your temporary addon descriptor URL then click install. (This step assumes that you have [turned on development mode][1])

Now your temporary add-on will be installed inside of your cloud development environment. If you swap back to the original tab in which you created your temporary add-on then you will start to see the events from your Atlassian Cloud development environment flowing through; you should already see the installed and enabled events registered.

## Local Development

You can run it locally for development or your own use:

### Prerequisites
- Node.js (version specified in `.nvmrc`)
- Docker (for Redis)

### Setup and Run
1. **Install Node.js version**: `nvm use`
2. **Install dependencies**: `npm install`
3. **Start Redis** (in one terminal): `docker run -p 6379:6379 redis`
4. **Start the application** (in another terminal): `npm run grunt`

The application will be available at `http://localhost:8080`.

## Screenshots

### Reading the event messages

![Screen Shot 2016-08-03 at 8.48.19 AM.png](https://bitbucket.org/repo/EByBz6/images/2057848657-Screen%20Shot%202016-08-03%20at%208.48.19%20AM.png)

### The introductory screen

![Screen Shot 2016-08-03 at 8.40.01 AM.png](https://bitbucket.org/repo/EByBz6/images/3710920323-Screen%20Shot%202016-08-03%20at%208.40.01%20AM.png)

[1]: https://developer.atlassian.com/static/connect/docs/latest/guides/development-setup.html
