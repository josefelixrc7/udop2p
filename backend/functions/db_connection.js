const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config();

exports.pool_conn = mariadb.createPool
({
    host: `${process.env.HOST_DB}`
    ,user: `${process.env.USER_DB}`
    ,password: `${process.env.PASSWORD_DB}`
});