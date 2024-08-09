import { GoogleSpreadsheet } from "google-spreadsheet";

const GOOGLE_SPREADSHEET_LINK = process.env.GOOGLE_SPREADSHEET_LINK;
const token = process.env.GOOGLE_OAUTH_TOKEN!;
const email = process.env.EMAIL!;
const message = process.env.MESSAGE!;

const doc = new GoogleSpreadsheet(extractSheetId(GOOGLE_SPREADSHEET_LINK), {
  token,
});

await doc.loadInfo();

await doc.updateProperties({ title: "Hoom contacts" });

const sheet = doc.sheetsByIndex[0];

const larryRow = await sheet.addRow({
  message,
  email,
});

function extractSheetId(url) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
