const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { bcrypt, hash } = require('bcrypt');
const InvariantError = require("../../exceptions/InvariantError");



class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
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

    // Jika result.rows.length menghasilkan nilai lebih dari 0, itu berarti username sudah ada di database
    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async getUserById(userId) {
    // Di dalamnya, lakukan kueri untuk mendapatkan id, username, dan fullname dari tabel users berdasarkan parameter userId.
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    // Bila nilainya 0, itu berarti user dengan id yang diminta tidak ditemukan.
    if (!result.rows.length) {
      throw new InvariantError('User tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = UsersService;