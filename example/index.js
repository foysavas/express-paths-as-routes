const express = require("express");
const expressMountHttpPaths = require("../index");

const app = express();
const port = 3000 || process.env.PORT;
app.use(expressMountHttpPaths(`${__dirname}/routes`));
app.listen(port, () => {
  console.log(`listening on http://127.0.0.1:${port}`);
});
