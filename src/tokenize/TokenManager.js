const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  // Buat properti fungsi generateAccessToken yang menerima satu parameter yakni payload.
  // generateAccess(payload) { // Parameter payload merupakan objek yang disimpan ke dalam salah satu artifacts JWT. Biasanya objek payload berisi properti yang mengindikasikan identitas pengguna, contohnya user id.
  //   return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY); // Fungsi generate menerima dua parameter, yang pertama adalah payload dan kedua adalah secretKey.
  // },
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
    // Untuk men-decoded token, gunakan fungsi Jwt.token.decode dan fungsi tersebut akan mengembalikan artifacts.  
    verifyRefreshToken: (refreshToken) => {
      try {
        const artifacts = Jwt.token.decode(refreshToken);
        // Fungsi verifySignature ini akan mengecek apakah refresh token memiliki signature yang sesuai atau tidak. Jika hasil verifikasi sesuai, fungsi ini akan lolos. Namun bila tidak, maka fungsi ini akan membangkitkan eror.
        Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY); // hanya menerima token dalam bentuk artifacts atau token yang sudah di-decoded
        const { payload } = artifacts.decoded;
        return payload;
      } catch (error) {
        throw new InvariantError('Refresh token tidak valid');
      }
    },
};

module.exports = TokenManager;