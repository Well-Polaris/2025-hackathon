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

### Conversation Starters:

- What are Aaron's active tasks today?
- Tell me about patient Joe Smith

### Knowledge Base:

(No files are needed for the demo, but you could consider adding e.g. lookup tables for medications, conditions, etc.)

Go ahead and save the GPT at this point, prior to setting up the actions.

## Creating the GPT Actions:

Take note of the **Callback URL** for the GPT. You'll need it for the next step.

### Polaris Client Application Configuration:

First you need to configure a client application in the Medplum web console.

- https://console.dev.apps.health/ClientApplication
- Click New
- Name: e.g. Hackaholics ChatGPT Action Client Application
- Description: e.g. ChatGPT Action Client Application for Hackaholics
- Redirect URIs: https://console.dev.apps.health/ClientApplication/___YOUR_GPT_ID___/oauth/callback
- Take note of the Client ID and Client Secret.
- Save and open the Client Application.
- Click on the Edit tab in the Client Application and choose "PKCE Optional"

### Polaris Action Configuration:

Click the gear icon to the right of the Actions section:

Choose Authentication Type: OAuth
Client ID: (from your MedPlum Client Application)
Client Secret: (from your MedPlum Client Application)
Authorization URL: https://data.dev.apps.health/oauth2/authorize
Token URL: https://data.dev.apps.health/oauth2/token
Scope: Scopes like "Task.read" could theoretically be added here, but use "_/_" as a placeholder. DO NOT LEAVE THIS BLANK.
Token Exchange Method: Default (POST request)
Paste in the **polaris-action-schema.json** file. Feel free to modify the schema to add additional capabilities! You have the full power of the Medplum FHIR server at your fingertips.

### Troubleshooting:

If the OAuth2 flow fails, ChatGPT redirects to the ChatGPT home screen without much explanation.
Double check that:

- The Client ID and Client Secret are correct.
- The Redirect URI is correct. Confirm it matches the **Callback URL** you see in the bottom left of the GPT
- The Scope is non-empty (e.g. Patient.read)
- The Authorization URL and Token URL are correct.

If the link is broken when you share it with another user, click on the "Share" button in the top right of the GPT and confirm that it's set to the GPT Store. **The sharing appears to revert to "Only Me" every time you save the GPT.**

### Privacy Policy

IT IS CRITICAL THAT YOU PROVIDE A PRIVACY POLICY URL. Otherwise ChatGPT will fail silently and redirect to the ChatGPT home screen. It doesn't need to be a 'real' privacy page, e.g. https://console.dev.apps.health/privacy is fine.
