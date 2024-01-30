const autoBind = require("auto-bind");

class CollaborationsHandler {
  constructor(collaborationsService, notesService, validator) {
    this._collaborationsService = collaborationsService;
    this._notesService = notesService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload); // memvalidasi request.payload menggunakan fungsi this._validator.validateCollaborationPayload
    const { id: credentialId } = request.auth.credentials; // sebelum menambahkan kolaborator pada catatan, pengguna yang mengajukan permintaan haruslah owner dari catatan tersebut.
    const { noteId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(noteId, credentialId); // Untuk memastikan hal itu, kita perlu verifikasi request.auth.credentials.id dan noteId yang berada di request.payload menggunakan fungsi this._notesService.verifyNoteOwner
    const collaborationId = await this._collaborationsService.addCollaboration(noteId, userId); // Setelah memastikan pengguna adalah owner dari catatan, selanjutnya kita bisa aman untuk menambahkan kolaborasi pada catatan tersebut. Silakan panggil fungsi this._collaborationsService.addCollaboration dengan membawa nilai noteId dan userId
 
    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { noteId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(noteId, credentialId);
    await this._collaborationsService.deleteCollaboration(noteId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;