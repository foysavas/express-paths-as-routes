# express-paths-as-routes

`express-paths-as-routes` lets you quickly organize your code in directories that match your service's URL paths and HTTP methods.


## Usage

If you organize a directory like this:

```
routes
├── get.js
├── session
│   ├── get.js
│   └── post.js
└── users
    └── :user_id
        └── get.js
```

And use it within your express app like this:

```
const app = require("express")();
const expressPathsAsRoutes = require("express-paths-as-routes");
app.use(expressPathsAsRoutes(`${__dirname}/routes`));
```

Then these example requests will be handled as follows:

```
GET  /                => ./routes/get.js
GET  /session         => ./routes/session/get.js
POST /session         => ./routes/session/post.js
GET  /users/:user_id  => ./routes/users/:user_id/get.js
```

## Alternatives

[https://github.com/DanielSunami/dir-routes](DanielSunami/dir-routes)