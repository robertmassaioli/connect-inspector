# Connect Inspector

> **⚠️ DEPRECATION NOTICE: This tool will be discontinued by the end of February 2026.**
> 
> We are open sourcing this repository so that people can copy it if they want to continue using it. The source code will be available at: http://go.atlassian.com/connect-inspector

> **⚠️ ATLASSIAN CONNECT END OF SUPPORT NOTICE**
>
> Atlassian Connect will reach end of support in December 2026. [Learn more about the end of support timeline](https://www.atlassian.com/blog/developer/announcing-connect-end-of-support-timeline-and-next-steps).
>
> **Migrate to Forge:** You should already be migrating to [Atlassian Forge](https://developer.atlassian.com/platform/adopting-forge-from-connect/). Forge provides similar functionality through event triggers:
> - [Jira Events](https://developer.atlassian.com/platform/forge/events-reference/jira/)
> - [Confluence Events](https://developer.atlassian.com/platform/forge/events-reference/confluence/)

The Atlassian Connect inspector allows you to generate temporary add-ons that you can install into you [Cloud Development Environment][1] and use to inspect the:

- Lifecycle events - See what happens when you install, enable, disable and uninstall an add-on.
- Webhook events - See what happens when any of the webhook events fire from the Atlassian Products. Like issue_updated or page_created.

Since the hosted version will be discontinued, you'll need to run it locally. This is a great way to inspect what messages are sent to Atlassian Connect add-ons and what the structure of their payloads will be.

## How to use the connect-inspector

Follow these steps to set up and use the connect-inspector locally:

### 1. Set up the local environment

First, you'll need to run the connect-inspector locally and make it accessible from the internet:

1. **Clone and set up the project** (see [Local Development](#local-development) section below for detailed steps)
2. **Start the application** - it will be running on `http://localhost:8080`
3. **Expose your local service** using a tunneling tool like [ngrok](https://ngrok.com/):
   ```bash
   # Install ngrok if you haven't already
   npm install -g ngrok
   
   # Expose your local port 8080
   ngrok http 8080
   ```
4. **Copy the public URL** that ngrok provides (e.g., `https://abc123.ngrok.io`)

### 2. Create and install your temporary add-on

Now you can use the publicly accessible connect-inspector:

1. **Navigate to your ngrok URL** (e.g., `https://abc123.ngrok.io`) in your browser
2. **Click 'Create temporary add-on'** to create a temporary add-on just for you
3. **Copy the descriptor URL** by clicking 'Copy descriptor to clipboard'
4. **Navigate to your Atlassian Cloud development environment** and go to the 'Manage add-ons' page
5. **Install the add-on** by clicking 'Upload add-on', pasting your descriptor URL, and clicking install
   
   > 📝 **Note:** This step requires that you have [enabled development mode][1] in your Atlassian Cloud instance.

### 3. Monitor events

Once installed, return to your connect-inspector tab (the ngrok URL) and you'll start seeing events from your Atlassian Cloud environment flowing through in real-time. You should immediately see the `installed` and `enabled` events.

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
