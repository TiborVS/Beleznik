const noteSchema = require('../schemas/Note');
const mongoose = require('mongoose');

module.exports = class NoteController {
    dbConn;
    Note;
    constructor(dbConn) {
        this.dbConn = dbConn;
        this.Note = dbConn.model("Note", noteSchema);
    }

    static ValidationError = class ValidationError extends Error {
        constructor(message) {
            super(message);
            this.name = "ValidationError";
        }
    }

    static NotFoundError = class NotFoundError extends Error {
        constructor(message) {
            super(message);
            this.name = "NotFoundError";
        }
    }

    static NotAllowedError = class NotAllowedError extends Error {
        constructor(message) {
            super(message);
            this.name = "NotAllowedError";
        }
    }

    async createNote(userId, content, title) {
        if (userId === undefined) throw new NoteController.ValidationError("User ID must be specified");
        if (!content) throw new NoteController.ValidationError("Cannot create empty note");
        if (!title) title = (new Date()).toISOString().split("T")[0] // današnji datum v YYYY-MM-DD formatu

        let note = new this.Note({
            title: title,
            content: content,
            userId: mongoose.Types.ObjectId.createFromHexString(userId)
        });

        await note.save();
        return note;
    }

    async getNotes(userId) {
        if (userId === undefined) throw new NoteController.ValidationError("User ID must be specified");
        
        let notes = await this.Note.find({ userId: mongoose.Types.ObjectId.createFromHexString(userId)});
        return notes;
    }

    async getNote(noteId) {
        if (noteId === undefined) throw new NoteController.ValidationError("Note ID must be specified");
        
        let note = await this.Note.findById(mongoose.Types.ObjectId.createFromHexString(noteId));
        if (!note) throw new NoteController.NotFoundError("Note with given ID was not found");
        return note;
    }

    async updateNote(noteId, userId, content, title) {
        if (noteId === undefined) throw new NoteController.ValidationError("Note ID must be specified");
        if (userId === undefined) throw new NoteController.ValidationError("User ID must be specified");

        if (!content && !title) throw new NoteController.ValidationError("Note content or title must be specified");

        let note = await this.Note.findById(mongoose.Types.ObjectId.createFromHexString(noteId));
        if (!note) throw new NoteController.NotFoundError("Note with given ID was not found");

        if (note.userId.toString() != userId) {
            throw new NoteController.NotAllowedError("Note cannot be edited by this user");
        }

        if (content) note.content = content;
        if (title) note.title = title;
        await note.save();
        return note;
    }

    async deleteNote(noteId, userId) {
        if (noteId === undefined) throw new NoteController.ValidationError("Note ID must be specified");
        if (userId === undefined) throw new NoteController.ValidationError("User ID must be specified");

        let note = await this.Note.findById(mongoose.Types.ObjectId.createFromHexString(noteId));
        if (!note) throw new NoteController.NotFoundError("Note with given ID was not found");

        if (note.userId.toString() != userId) {
            throw new NoteController.NotAllowedError("Note cannot be deleted by this user");
        }
        note = await this.Note.findByIdAndDelete(noteId);
        return note;
    }
}