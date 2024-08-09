import { Client } from "@hubspot/api-client";

const accessToken = process.env.HUBSPOT_OAUTH_TOKEN;
const email = process.env.EMAIL;
const message = process.env.MESSAGE;

if (!accessToken || !email || !message) {
  console.error("Missing environment variables");
  process.exit(1);
}
// Define the interface for the contact properties
interface HubSpotContactProperties {
  email: string;
  message: string;
}

// Function to create or update a contact in HubSpot
async function syncHubSpotContact(
  accessToken: string,
  email: string,
  message: string
) {
  const hubspotClient = new Client({ accessToken });

  // Prepare the properties for the contact
  const properties: HubSpotContactProperties = {
    email,
    message,
  };

  const contact = {
    properties,
  };

  try {
    // Search for the contact by email to see if it exists
    const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["email"],
    });

    // Check if the searchResponse and its body are defined
    if (searchResponse) {
      if (searchResponse["total"] > 0) {
        // If the contact exists, update it
        const contactId = searchResponse.results[0].id;
        await hubspotClient.crm.contacts.basicApi.update(contactId, {
          properties,
        });
        console.log("Contact updated successfully");
      } else {
        // If the contact does not exist, create a new one
        await hubspotClient.crm.contacts.basicApi.create({ properties });
        console.log("Contact created successfully");
      }
    } else {
      console.error("Invalid response from search API:", searchResponse);
    }
  } catch (error) {
    console.error(
      "Error syncing contact:",
      error.response ? error.response.body : error.message
    );
  }
}

syncHubSpotContact(accessToken, email, message);
