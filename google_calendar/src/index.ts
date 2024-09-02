import { google } from "googleapis";
import OpenAI from "openai";

// Environment variables coming from hoom
const email = process.env.EMAIL;
const message = process.env.MESSAGE;
const openaiApiKey = process.env.OPENAI_KEY;
const attendeeMain = process.env.ATTENDEE || "hi@hitesh.io";

//coming from ploton
const googleAccessToken = process.env.GOOGLECAL_OAUTH_TOKEN;

if (!email || !googleAccessToken || !message || !openaiApiKey) {
  throw new Error("Missing environment variables.");
  process.exit(1);
}

//EXtract date and time from the message using OpenAI 4o-mini model.
async function extractDateTimeFromText(text: string): Promise<Date | null> {
  const client = new OpenAI({
    apiKey: openaiApiKey,
  });

  try {
    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const content = `Today is ${currentDate}. Extract the date and time from the following text: "${text}". Return an ISO formatted date and time in UTC. If the text does not contain a date and time, return null. Do not include any explanations or additional text.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
    });

    const result = response.choices[0].message.content?.trim();
    console.log("Result:", response);
    console.log("Text:", text);

    if (result && Date.parse(result)) {
      return new Date(result);
    }

    return null;
  } catch (error) {
    console.error("Error extracting date and time:", error);
    return null;
  }
}

//Send Google Calendar invite to the attendee.
async function sendGoogleCalendarInvite(
  date: Date,
  email: string,
  accessToken: string
) {
  try {
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary: "Scheduled Meeting",
      description: `Meeting scheduled via Hoom. Context: ${message}`,
      start: {
        dateTime: date.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // 1-hour meeting
        timeZone: "UTC",
      },
      attendees: [{ email }, { email: attendeeMain }],
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "all", // Sends email invite to attendees
    });

    console.log("Event created:", response.data.htmlLink);
  } catch (error) {
    console.error("Error sending calendar invite:", error);
  }
}

extractDateTimeFromText(message).then((dateTime) => {
  if (dateTime) {
    sendGoogleCalendarInvite(dateTime, email!, googleAccessToken!);
  } else {
    console.log("Could not extract date and time from the text.");
  }
});
