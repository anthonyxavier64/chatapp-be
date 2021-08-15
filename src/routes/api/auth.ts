import express from "express";
import userController from '../../controllers/users';

const router = express.Router();

router.post("/create", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/token", userController.getNewAccessToken);

export = router;
