const router = require("express").Router();
const { post, user, event, home, content } = require("../controllers");
const verifyUser = require("../configs/verify");

router.get("/", verifyUser.isLogin, home.home);

// Content
router.get("/content", verifyUser.isLogin, content.list);
router.post("/content/update", verifyUser.isLogin, content.update);

// Event
router.get("/event", verifyUser.isLogin, event.list);

module.exports = router;
