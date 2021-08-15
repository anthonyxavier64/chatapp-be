import bcrypt from "bcryptjs";
import { User } from "../models";
import { pool } from "../app";
import jwt from "../middleware/jwt";
import JWT from "jsonwebtoken";

const register = (req, res) => {
  const { email, password, rePassword, firstName, lastName } = req.body;

  if (password !== rePassword) {
    return res.status(400).json({
      message: "passwords do not match",
    });
  }

  bcrypt.hash(password, 10, (hashError, hash) => {
    if (hashError) {
      res.status(401).json({
        message: hashError.message,
        error: hashError,
      });
    }

    const user: User = {
      email,
      password: hash,
      firstName,
      lastName,
    };

    pool.query(
      "INSERT INTO users (email, password, firstname, lastname) VALUES ($1, $2, $3, $4)",
      [user.email, user.password, user.firstName, user.lastName],
      (error, result) => {
        if (error) {
          res.status(400).json({
            message: error.message,
            error,
          });
        } else {
          res.status(200).json({
            message: "user created",
          });
        }
      }
    );
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  pool.query(`SELECT * FROM users WHERE email = '${email}'`, (err, result) => {
    if (err) {
      res.status(404).json({
        message: err.message,
        err,
      });
    } else {
      const user = result.rows[0];

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.status(401).json({
            message: "Incorrect password",
          });
        } else {
          const accessToken = jwt.generateAccessToken(email);
          const refreshToken = jwt.generateRefreshToken(email);

          pool.query(
            "INSERT INTO refreshtokens (refreshtoken) VALUES ($1)",
            [refreshToken],
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(400).json({
                  message: err.message,
                  err,
                });
              } else {
                const userObj = {
                  email: user.email,
                  firstName: user.firstname,
                  lastName: user.lastname,
                };

                res.status(200).json({
                  userObj,
                  accessToken,
                  refreshToken,
                });
              }
            }
          );
        }
      });
    }
  });
};

const logout = (req, res) => {
  const refreshToken = req.body.refreshToken;

  pool.query(
    `
        DELETE FROM refreshtokens
        WHERE refreshtoken = '${refreshToken}'
    `,
    (err, result) => {
      if (err) {
        res.status(400).json({
          message: err.message,
          err,
        });
      } else {
        res.status(200).json({
          message: "refresh token deleted",
        });
      }
    }
  );
};

const getAllUsers = (req, res) => {
  pool.query("SELECT email FROM users", (err, results) => {
    if (err) {
      res.status(400).json({
        message: "unable to retrieve users",
      });
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const getNewAccessToken = (req, res) => {
  const { refreshToken, email } = req.body;

  if (!refreshToken) {
    res.status(400).json({
      message: "no refresh token provided",
    });
  } else {
    pool.query(
      `SELECT FROM refreshtokens WHERE refreshtoken = '${refreshToken}'`,
      (err, results) => {
        if (err) {
          res.status(400).json({
            message: err.message,
            err,
          });
        } else {
          if (!results.rows[0]) {
            res.status(403).json({
              message: "invalid refresh token",
            });
          } else {
            JWT.verify(
              refreshToken,
              process.env.REFRESH_TOKEN_SECRET,
              (err, result) => {
                if (err) {
                  res.status(400).json({
                    message: err.message,
                    err,
                  });
                } else {
                  const accessToken = jwt.generateAccessToken(email);
                  res.status(200).json({
                      accessToken
                  })
                }
              }
            );
          }
        }
      }
    );
  }
};

export default { register, login, logout, getAllUsers, getNewAccessToken };
