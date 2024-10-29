import mongoose from "mongoose";

// Define the website schema
const websiteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    hostname: {
        type: String,
        required: true,
    },
    keywords: {
        type: [String],
        trim: true,
    },
}, {
    timestamps: true,
});

// Create a model based on the schema
export const Website = mongoose.model('Website', websiteSchema);

