# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this project on your local machine, follow these steps:

### 1. Install Dependencies

First, install the necessary packages using npm:

```bash
npm install
```

### 2. Set Up Environment Variables

The application requires several API keys and credentials to function correctly.

1.  Create a new file named `.env` in the root of the project.
2.  Copy the contents of `.env.example` into your new `.env` file.
3.  Fill in the values for each variable. You can find instructions on where to get these keys in the `.env.example` file.

### 3. Run the Development Server

Once your dependencies are installed and your environment variables are set, you can start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:9002](http://localhost:9002).

## Deploying to Firebase

To deploy your application and get a stable public URL (and stop using ngrok), you can use Firebase App Hosting.

### 1. Install the Firebase CLI

If you don't already have it, install the Firebase command-line tool globally:

```bash
npm install -g firebase-tools
```

### 2. Log in to Firebase

Log in to your Firebase account in your terminal:

```bash
firebase login
```

### 3. Deploy Your App

From your project's root directory, run the deploy command:

```bash
firebase deploy
```

Firebase will build your Next.js application and deploy it. This may take a few minutes.

### 4. Get Your Public URL

Once the deployment is complete, the Firebase CLI will output your public **Backend URL**. It will look something like this: `https://<your-backend-id>.<region>.run.app`.

### 5. Update Your Twilio Webhook

1.  Go to your Twilio account settings.
2.  Find your WhatsApp sender's configuration.
3.  Update the webhook URL for incoming messages to your new Firebase URL, making sure to add the `/api/whatsapp` path at the end. For example:

    `https://<your-backend-id>.<region>.run.app/api/whatsapp`

Now, all incoming WhatsApp messages will be sent directly to your deployed application, and you no longer need to use ngrok.
