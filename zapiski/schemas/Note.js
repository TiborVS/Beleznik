const mongoose = require('mongoose');
const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    userId: mongoose.Types.ObjectId
}, { timestamps: true });

module.exports = noteSchema;
