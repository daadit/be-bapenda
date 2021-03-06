const config = require("../configs/database");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const { JWTSECRET } = require("../configs/jwt");

const mysql = require("mysql");
const pool = mysql.createPool(config.dbLocal);

pool.on("error", (err) => {
    console.error(err);
});

module.exports = {
    login(req, res) {
        try {
            let email = req.body.email;
            let password = req.body.password;
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    `
                    SELECT * FROM tb_users WHERE user_status = 1 AND user_email = ? LIMIT 1;
                    `,
                    [email],
                    function (err, data) {
                        if (data[0]) {
                            let validPassword = bcrypt.compareSync(password, data[0]["user_password"]);
                            console.log(data[0]["user_password"]);
                            if (!validPassword) {
                                return res.status(400).send({
                                    success: false,
                                    message: "Password yang anda input salah!",
                                });
                            } else {
                                let token = jwt.sign(
                                    {
                                        email: data[0]["user_email"],
                                        name: data[0]["user_name"],
                                        role: data[0]["user_role"],
                                    },
                                    JWTSECRET
                                );
                                return res.status(200).send({
                                    success: true,
                                    token: "Bearer" + " " + token,
                                });
                            }
                        } else {
                            return res.status(400).send({
                                success: false,
                                message: "Email belum terdaftar!",
                            });
                        }
                    }
                );
                connection.release();
            });
        } catch (error) {
            return res.status(500).send({
                success: false,
                message: error,
            });
        }
    },
    register(req, res) {
        try {
            let pass = bcrypt.hashSync(req.body.password, 10);
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    "INSERT INTO tb_users SET ? ",
                    {
                        user_email: req.body.email,
                        user_name: req.body.name,
                        user_password: pass,
                        user_role: 1,
                        user_status: 1,
                        user_created_at: new Date(),
                        user_updated_at: new Date(),
                    },
                    function (error, results) {
                        if (error)
                            return res.status(400).send({
                                success: false,
                                message: error,
                            });
                        return res.status(200).send({
                            success: true,
                            data: results,
                        });
                    }
                );
                connection.release();
            });
        } catch (error) {
            return res.status(500).send({
                success: false,
                message: error,
            });
        }
    },
};
