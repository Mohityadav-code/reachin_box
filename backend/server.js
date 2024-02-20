const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { OpenAI } = require('openai');

async function getSentimentsOfMail(emailDetails) {

    const openai = new OpenAI({
        apiKey: "sk-RvK#############"
    });
    const newEmailsWithSentiment = [];
    for (const email of emailDetails) {

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: `Analyze the sentiment of this email and determine if the user is interested in the product , only return either of these words depeneding on sentiment ['Interested','Not Interested','More information']  if not able to understand then choose 'More information': ${email.snippet}` }],
            model: "gpt-3.5-turbo",
        });




        console.log(completion.choices[0]);
        const sentiment = completion.choices[0];

        newEmailsWithSentiment.push({
            ...email,
            sentiment: sentiment 
        });
    }
}


// Constants (Adjust accordingly)
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// --- Authorization Functions ---
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        return google.auth.fromJSON(JSON.parse(content));
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

// --- Gmail API Functions ---
async function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({ userId: 'me' });
    return res.data.labels || []; // Handle case where no labels exist
}


async function fetchNewEmails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });

    // Search for unread emails
    const searchResult = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread', // You can customize the search further if needed,
        maxResults: 5,

    });

    const messageIds = searchResult.data.messages?.map(msg => msg.id) || [];

    // Fetch basic details of each email
    const promises = messageIds.map(id =>
        gmail.users.messages.get({ userId: 'me', id })
    );
    const emailDetails = await Promise.all(promises);
    // Format & return the desired data
    const sentiments = getSentimentsOfMail(emailDetails);
    console.log("sentiments", sentiments);
    return emailDetails.map(email => ({
        id: email.data.id,
        snippet: email.data.snippet,
        // add any other fields you need from email.data
    }));



}

async function sendMessage(auth, message) {
    const gmail = google.gmail({ version: 'v1', auth });

    // Base64url encode the raw message
    const rawMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    try {
        await gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: rawMessage
            }
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

function createEmail(to, from, subject, messageText) {
    const email = [
        `Content-Type: text/plain; charset="UTF-8"\n`,
        `MIME-Version: 1.0\n`,
        `Content-Transfer-Encoding: 7bit\n`,
        `to: ${to}\n`,
        `from: ${from}\n`,
        `subject: ${subject}\n\n`,
        messageText
    ].join('');

    return email;
}



// --- Express Backend Setup ---
const app = express();
app.use(express.json());
const port = 8000;

// API Endpoints
app.get('/labels', async (req, res) => {
    try {
        const auth = await authorize();
        const labels = await listLabels(auth);
        res.json(labels);
    } catch (error) {
        console.error('Error in /labels:', error);
        res.status(500).send('Error fetching labels');
    }
});

app.get('/new-emails', async (req, res) => {
    try {
        const auth = await authorize();
        const newEmails = await fetchNewEmails(auth);
        res.json(newEmails);
    } catch (error) {
        console.error('Error in /new-emails:', error);
        res.status(500).send('Error fetching new emails');
    }
});

app.post('/send-mail', async (req, res) => {
    try {
        const auth = await authorize();
        console.log("req.body", req.body);
        const { to, subject, text } = req.body;
        const rawMessage = createEmail(to, 'picoman3322@gmail.com', subject, text);

        await sendMessage(auth, rawMessage);

        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error in /send-mail:', error);
        res.status(500).send('Error sending email');
    }
});


app.listen(port, () => {
    console.log(`Gmail API backend listening on port ${port}`);
});

