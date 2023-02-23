const express = require("express");
const bodyParser = require("body-parser");
const log4js = require("log4js");
const fs = require("fs");
const { body, validationResult } = require("express-validator");

const userFilePath = "./storage/users.json";

const logger = log4js.getLogger();
logger.level = "debug";
const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    message: "Hello World!",
  });
});

app.get("/user/:id", (req, res) => {
  const userId = Number(req.params.id);
  const { users } = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
  const targetUser = users.find((user) => user.id === userId);

  logger.debug("User ID:", users);

  if (!targetUser) {
    res
      .status(404)
      .json({
        message: `User ${userId} is Not Found.`,
      })
      .end();
  }
  res.json({
    id: userId,
    name: targetUser.name,
    displayName: targetUser.displayName,
  });
});

app.post(
  "/user",
  body("name").not().isEmpty(),
  body("name").isLength({ min: 4, max: 20 }),
  body("displayName").not().isEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "name and displayName is required." })
        .end();
    }

    const { users } = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
    users.sort((a, b) => a.id - b.id);

    const newUser = {
      id: users[users.length - 1].id + 1,
      name: req.body.name,
      displayName: req.body.displayName,
    };

    const newUserList = { users: [...users, newUser] };

    fs.writeFileSync(userFilePath, JSON.stringify(newUserList));

    res.json(newUser);
  }
);

app.listen(process.env.PORT || 3000, () => {
  console.log("サーバー起動中");
});
