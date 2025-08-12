import mongoose from "mongoose";

const customerFileSchema = new mongoose.Schema(
    {
        customerId: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        addresses: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    { timestamps: true }
);

const customerFileModel =
    mongoose.models.CustomerFile || mongoose.model("CustomerFile", customerFileSchema);

export default customerFileModel;
