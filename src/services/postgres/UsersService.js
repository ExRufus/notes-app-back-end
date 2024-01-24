const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const bcrypt = require('bcrypt');
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    // TODO: Verifikasi username, pastikan belum terdaftar.
    await this.verifyNewUsername(username);

    // TODO: Bila verifikasi lolos, maka masukkan user baru ke database.
    const id = `user-${nanoid(16)}`;
    // sebelum dimasukkan kedalam database password yang di input oleh user di hash terlebih dahulu
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async getUserById(userId) {
    //  lakukan kueri untuk mendapatkan id, username, dan fullname dari tabel users berdasarkan parameter userId
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    // Bila nilainya 0, itu berarti user dengan id yang diminta tidak ditemukan.  
    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // Selain itu, kembalikan fungsi getUserById dengan nilai user yang didapat pada result.rows[0].
    return result.rows[0];
  }

  // Fungsi yang dimaksud adalah verifikasi apakah kredensial atau username dan password yang dikirimkan oleh pengguna benar atau tidak.
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kredensial yang anda berikan salah');
    }

    // Untuk nilai password, kita tampung ke variabel hashe Password ya biar tidak ambigu dengan variabel password di parameter.
    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    // Sekarang kita bisa evaluasi variabel match, jika hasilnya false, bangkitkan eror AuthenticationError dengan pesan ‘Kredensial yang Anda berikan salah’. Jika hasilnya true, kembalikan dengan nilai id user.
    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    // Nilai user id tersebut nantinya akan digunakan dalam membuat access token dan refresh token.
    return id;
  }
}

module.exports = UsersService;