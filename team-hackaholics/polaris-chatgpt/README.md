# Instructions for setting up a custom GPT in ChatGPT

You will need a PAID ChatGPT account to create or configure a custom GPT. However, you can use a free account to use the custom GPT.

## Create a new GPT

Once you've signed in with ChatGPT, open the sidebar and click "Expore GPTs".
A Create button is shown at the top right of the screen.

## Configure the GPT

(Once a GPT is created, you can edit it by choosing it as a GPT and then using its dropdown menu to select "Edit GPT".)

### GPT Name:

e.g. Polaris Hackaholics

### Description:

Allows you to interact with your Polaris MedPlum site.

### Prompt:

(see reference file)

Conversation Starters:

- What are Aaron's active tasks today?
- Tell me about patient Joe Smith

### Knowledge Base:

(No files are needed for the demo, but you could consider adding e.g. lookup tables for medications, conditions, etc.)

### Actions:

### Polaris Action Configuration:

First you need to configure a client application in the Medplum web console.

- https://console.dev.apps.health/ClientApplication
- Click New
- Name: e.g. Hackaholics ChatGPT Action Client Application
- Description: e.g. ChatGPT Action Client Application for Hackaholics
- Redirect URIs: https://console.dev.apps.health/ClientApplication/___YOUR_GPT_ID___/oauth/callback
- Take note of the Client ID and Client Secret.

Click the gear icon to the right of the Actions section:

Choose Authentication Type: OAuth
Client ID: (from your MedPlum Client Application)
Client Secret: (from your MedPlum Client Application)
Authorization URL: https://data.dev.apps.health/oauth2/authorize
Token URL: https://data.dev.apps.health/oauth2/token
Scope: Scopes like "Task.read" could theoretically be added here, but they aren't used by the Medplum FHIR server for this client.
Token Exchange Method: Default (POST request)

### Schema

Paste in the polaris-action-schema.json file. Feel free to modify the schema to add additional capabilities! You have the full power of the Medplum FHIR server at your fingertips.

### Privacy Policy

IT IS CRITICAL THAT YOU PROVIDE A PRIVACY POLICY URL. Otherwise ChatGPT will fail silently and redirect to the ChatGPT home screen. It doesn't need to be a 'real' privacy page, e.g. https://console.dev.apps.health/privacy is fine.
