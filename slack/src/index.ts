import { IncomingWebhook } from "@slack/webhook";

const url = process.env.SLACK_WEBHOOK_URL;
const message = process.env.MESSAGE;
const email = process.env.EMAIL;

if (!url || !message || !email) {
  console.error(
    "You need env variables for slack webhook url, message and email"
  );
  process.exit(1);
}

const webhook = new IncomingWebhook(url);

// Send the notification
(async () => {
  await webhook.send({
    text: `New Hoom Message: ${message}`,
    attachments: [
      {
        color: "#36a64f",
        text: `Email: ${email}`,
      },
    ],
  });
})();
