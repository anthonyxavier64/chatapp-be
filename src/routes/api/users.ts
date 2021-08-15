import express from "express";
import userController from '../../controllers/users';

const router = express.Router();

router.get("/get-users", userController.getAllUsers);

export = router;
