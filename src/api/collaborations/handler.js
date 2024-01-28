const autoBind = require("auto-bind");

class CollaborationsHandler {
  constructor(collaborationsService, notesService, validator) {
    this._collaborationsService = collaborationsService;
    this._notesService = notesService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {

  }

  async deleteCollaborationHandler(request, h) {
    
  }
}