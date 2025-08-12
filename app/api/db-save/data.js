import { json } from "@remix-run/node";
import customerFileModel from "../../models/customer";

export const loader = async () => {
    try {
        const customers = await customerFileModel.find({});
        return json({ customers });
    } catch (error) {
        return json({ error: "Failed to fetch books" }, { status: 500 });
    }
};


export const action = async ({ request }) => {
    const formData = await request.formData();
    const firstName = formData.get("firstName");
    const customerId = formData.get("customerId");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const addresses = JSON.parse(formData.get("addresses"))

    if (!email || !customerId || !firstName || !lastName || !addresses) {
        return json({ error: "Missing required fields" }, { status: 400 });
    }
    try {
        const customer = await customerFileModel.create({ firstName, customerId, lastName, email, addresses });
        return json({ success: true, customer });
    } catch (err) {
        console.error("❌ Error saving book:", err);
        return json({ error: "Database error" }, { status: 500 });
    }
};