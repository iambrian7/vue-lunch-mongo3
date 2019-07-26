
const express = require("express");
const router = express.Router();
const LunchesController = require('../controllers/LunchesController')

  router.get('/', LunchesController.index)
  router.get('/lunches/:lunchId', LunchesController.show)
  router.post('/lunches', LunchesController.post)
  router.put('/lunches/:lunchId',LunchesController.put)
  // router.get('/groups', GroupsController.index)
  // router.post('/groups', GroupsController.post)

module.exports = router;
