'use strict';
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');

router.post('/', (req, res, next) => {
  const { username, password, fullName } = req.body;
  //username and password are required
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    const err = new Error(`Missing '${missingField}' in requrest body`);
    err.status = 422;
    return next(err);
  }
  //fields are type string
  const stringFields = ['username', 'password', 'fullName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  if (
    username.indexOf(' ') === 0 ||
    username.indexOf(' ') === username.length - 1 ||
    password.indexOf(' ') === 0 ||
    password.indexOf(' ') === password.length - 1
  ) {
    const err = new Error(
      'No whitespace allowed before or after username/password'
    );
    err.status = 400;
    next(err);
  }

  // trim whitespace
  // const trimFields = ['username, password'];
  // const notTrimmed = trimFields.find(
  //   field => req.body[field].trim() !== req.body[field]
  // );

  // if (notTrimmed) {
  //   return res.status(422).json({
  //     code: 422,
  //     reason: 'ValidationError',
  //     message: 'Incorrect field type: expected string',
  //     location: notTrimmed
  //   });
  // }

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        fullName,
        username,
        password: digest
      };
      return User.create(newUser);
    })
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;
