const autoBind = require("auto-bind");

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;
    // Karena fungsi verifyUserCredential mengembalikan nilai id dari user, maka tampung nilai tersebut pada variabel id.
    const id = await this._usersService.verifyUserCredential(username, password);

    // Setelah proses memverifikasi kredensial selesai, kita bisa lanjutkan dengan membuat access token dan refresh token, serta membawa objek payload yang memiliki properti id user
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    // Silakan gunakan fungsi this._authenticationsService.addRefreshToken untuk menyimpan refreshToken.
    await this._authenticationsService.addRefreshToken(refreshToken);

    // Terakhir, kita tinggal kembalikan request dengan respons yang membawa accessToken dan refreshToken di data body.
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request, h) {
    // Setelah request.payload divalidasi, kita bisa dapatkan nilai refreshToken dari request payload untuk kemudian menghapus token tersebut dari database.
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    // Sebelum menghapusnya kita perlu memastikan refreshToken tersebut ada di database. Caranya, gunakan fungsi this._authenticationsService.verifyRefreshToken.
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    // Setelah proses verifikasi refreshToken selesai, kita bisa lanjut menghapusnya dari database menggunakan fungsi this._authenticationsService.deleteRefreshToken.
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
