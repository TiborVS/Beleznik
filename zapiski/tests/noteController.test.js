const NoteController = require('../controllers/noteController');
const mongoose = require('mongoose');

class MockNoteModel {
    obj = {}
    constructor(obj) {
        this.obj = obj;
    }
    save = jest.fn();
    static find = jest.fn();
    static findById = jest.fn();
}

class MockDbConnection {
    constructor() {}
    model() {return MockNoteModel}
}

const fakeNote = {
    title: "some title",
    content: "some content",
    userId: mongoose.Types.ObjectId.createFromHexString("67ed2e079055198abb691cfd")
}

const fakeNoteArray = [
    new MockNoteModel({
        title: "some title",
        content: "some content",
        userId: mongoose.Types.ObjectId.createFromHexString("67ed2e079055198abb691cfd")
    }),
    new MockNoteModel({
        title: "some other title",
        content: "some more content",
        userId: mongoose.Types.ObjectId.createFromHexString("67ed2e079055198abb691cfd")
    })
]


let controller;

beforeEach(() => {
    controller = new NoteController(new MockDbConnection());
})

afterEach(() => {
    controller = undefined;
    jest.clearAllMocks();
})

describe('creating note', () => {
    test('controller creates note given valid input', async () => {
        let note = await controller.createNote(fakeNote.userId.toString(), fakeNote.content, fakeNote.title);
        expect(note).toBeInstanceOf(MockNoteModel);
        expect(note.save.mock.calls).toHaveLength(1);
        expect(note.obj).toEqual(fakeNote);
    })
    
    test('controller creates note given valid input without title', async () => {
        let note = await controller.createNote(fakeNote.userId.toString(), fakeNote.content);
        expect(note).toBeInstanceOf(MockNoteModel);
        expect(note.save.mock.calls).toHaveLength(1);
        expect(note.obj).toEqual({title: (new Date()).toISOString().split("T")[0], content: fakeNote.content, userId: fakeNote.userId});
    })
    
    test('controller throws error on invalid user id', async () => {
        try {
            await controller.createNote("abc", "some content", "some title");
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
        expect.hasAssertions();
    })
    
    test('controller throws error on no content provided', async () => {
        try {
            await controller.createNote("67ed2e079055198abb691cfd");
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
        expect.hasAssertions();
    })
})

describe('getting notes by user id', () => {
    test('controller gets notes from user', async () => {
        MockNoteModel.find.mockReturnValueOnce(fakeNoteArray)
        let notes = await controller.getNotes("67ed2e079055198abb691cfd");
        expect(notes).toBeInstanceOf(Array);
        expect(MockNoteModel.find.mock.calls).toHaveLength(1);
        expect(MockNoteModel.find.mock.calls[0][0]).toEqual({ userId: fakeNote.userId});
    })

    test('controller throws error on invalid user id', async () => {
        try {
            await controller.getNotes("abc");
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
        expect.hasAssertions();
    })

    test('controller throws error on no user id', async () => {
        try {
            await controller.getNotes();
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
        expect.hasAssertions();
    })
})

describe('getting note by id', () => {
    test('controller gets note by id', async () => {
        MockNoteModel.findById.mockReturnValueOnce(fakeNote);
        let note = await controller.getNote("67ed2e079055198abb691cfd");
        expect(note).toEqual(fakeNote);
        expect(MockNoteModel.findById.mock.calls).toHaveLength(1);
        expect(MockNoteModel.findById.mock.calls[0][0]).toEqual(mongoose.Types.ObjectId.createFromHexString("67ed2e079055198abb691cfd"));
    })

    test('controller throws error on nonexistent note', async ()=> {
        MockNoteModel.findById.mockReturnValueOnce(null);
        try {
            await controller.getNote("67ed2e079055198abb691cfd");
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
        expect.hasAssertions();
    })

    test('controller throws error on invalid note id', async () => {
        try {
            await controller.getNote("abc");
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
        expect.hasAssertions();
    })

    test('controller throws error on no note id', async () => {
        try {
            await controller.getNote();
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
        expect.hasAssertions();
    })
})
