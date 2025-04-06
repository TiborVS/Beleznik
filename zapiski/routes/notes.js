var express = require('express');
var router = express.Router();
const NoteController = require('../controllers/noteController');
const mongoose = require('mongoose');

const controller = new NoteController(mongoose.connection);

function handleError(err, res) {
    if (err instanceof NoteController.ValidationError) {
        return res.status(400).json({error: err.message});
    }
    else if (err instanceof NoteController.NotFoundError) {
        return res.status(404).json({error: err.message});
    }
    else if (err instanceof NoteController.NotAllowedError) {
        return res.status(403).json({error: err.message});
    }
    else {
        console.log(err.message);
        return res.status(500).json({error: "Unknown error getting notes"});
    }
}

router.post("/", async function (req, res, next) {
    try {
        let newNote = await controller.createNote(req.body.userId, req.body.content, req.body.title);
        return res.status(201).json({message: "Successfully created new note", note: newNote});
    }
    catch (err) {
        return handleError(err, res);
    }
});

router.get("/", async function (req, res, next) {
    try {
        let notes = await controller.getNotes(req.body.userId);
        return res.status(200).json(notes);
    }
    catch (err) {
        return handleError(err, res);
    }
})

router.get("/:noteId", async function (req, res, next) {
    try {
        let note = await controller.getNote(req.params.noteId);
        return res.status(200).json(note);
    }
    catch (err) {
        return handleError(err, res);
    }
});

router.put("/:noteId", async function (req, res, next) {
    try {
        let note = await controller.updateNote(req.params.noteId, req.body.userId, req.body.content, req.body.title);
        return res.status(200).json({message: "Successfully updated note", note: note});
    }
    catch (err) {
        return handleError(err, res);
    }
});

router.delete("/:noteId", async function (req, res, next) {
    try {
        let note = await controller.deleteNote(req.params.noteId, req.body.userId);
        return res.status(200).json({message: "Successfully removed note", note: note});
    }
    catch (err) {
        return handleError(err, res);
    }
});

module.exports = router;
