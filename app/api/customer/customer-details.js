
import { json } from "@remix-run/node";
import { unauthenticated } from "../../shopify.server";

// CORS headers for reuse
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const action = async ({ request }) => {
  const body = await request.json();
  const { customerId } = body;
  console.log("Received customerId:", customerId);

  try {
    const shop = "ram-kumawat-dev.myshopify.com";
    const { admin } = await unauthenticated.admin(shop);

    const query = `
      {
        customer(id: "gid://shopify/Customer/${customerId}") {
          id
          firstName
          lastName
          email
          addresses {
            city
            country
            province
          }
        }
      }
    `;

    const response = await admin.graphql(query);
    const data = await response.json();

    return json({ success: true, result: data }, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Error fetching customer:", error);
    return json({ success: false, error: error.message }, {
      status: 500,
      headers: corsHeaders,
    });
  }
};

// Handle preflight OPTIONS request
export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
          
  return json({ message: "Use POST for this route." });
};
