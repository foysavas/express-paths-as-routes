const path = require("path");
const express = require("express");
const recursiveReadSync = require("recursive-readdir-sync");

function parseRoutes(api_dir, opts = {}) {
  const routes = {};
  api_dir = path.resolve(api_dir);
  const files = recursiveReadSync(api_dir)
    .map((fp) => {
      return fp.substr(api_dir.length);
    })
    .sort((a, b) => {
      const asplit = a.split("/");
      const bsplit = b.split("/");
      const is_a_longer = asplit.length > bsplit.length;
      const shorter_length = is_a_longer ? bsplit.length : asplit.length;
      for (let i = 0; i < shorter_length; i++) {
        if (asplit[i] === bsplit[i]) {
          // noop
        } else if (
          asplit[i].indexOf(":") != -1 &&
          bsplit[i].indexOf(":") != -1
        ) {
          return bsplit[i].indexOf(":") - asplit[i].indexOf(":");
        } else if (asplit[i].indexOf(":") != -1) {
          return 1;
        } else if (bsplit[i].indexOf(":") != -1) {
          return -1;
        } else if (asplit.length == bsplit.length) {
          return asplit[i].localeCompare(bsplit[i]);
        }
      }
      return !is_a_longer;
    });
  for (const fp of files) {
    const segments = fp.split("/");
    const file = segments.pop();
    let filepath = segments.join("/");
    if (filepath === "") {
      filepath = "/";
    }
    if (!routes[filepath]) {
      routes[filepath] = {
        files: [],
        methods: [],
      };
    }
    const route = routes[filepath];
    const m = file.match(/^(get|post|put|delete|patch)[\.|\+]/);
    if (m && route.methods.indexOf(m[1]) == -1) {
      route.methods.push(m[1]);
    }
    route.files.push(file);
    routes[filepath] = route;
  }
  return routes;
}

module.exports = function (api_dir, opts = {}) {
  const router = express.Router();
  const routes = parseRoutes(api_dir, opts);
  for (const route_path of Object.keys(routes)) {
    const route_info = routes[route_path];
    for (const route_meth of route_info.methods) {
      router[route_meth](route_path, function (req, res, next) {
        const meth = req.method.toLowerCase();
        if (route_info.methods.indexOf(meth) === -1) {
          next();
        }
        const default_re = new RegExp("^" + meth + "\\.");
        const tmpl_name = route_info.files.filter((tn) =>
          tn.match(default_re)
        )[0];
        const tmpl = `${api_dir}${req.route.path}/${tmpl_name}`;
        if (process.env.NODE_ENV !== 'production') {
          delete require.cache[require.resolve(tmpl)];
        }
        const tmplFunc = require(tmpl);
        if (typeof tmplFunc === "function") {
          return tmplFunc(req, res);
        } else if (
          typeof tmplFunc === "object" &&
          typeof tmplFunc.default === "function"
        ) {
          return tmplFunc.default(req, res);
        }
      });
    }
  }
  return router;
};
