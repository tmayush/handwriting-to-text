const { GLOBAL_ROUTES } = require("../globals/global");

GLOBAL_ROUTES.routes = {
  // home: [/^\/hello\.?(\.html)?$/g, checkWithRegex, doSomething],
  home: ["/", doSomething],
};

function toRoute(url) {
  for (const [key, value] of Object.entries(GLOBAL_ROUTES.routes)) {
    if (url == value[0]) {
      value[1](url);
    }
  }
}

function doSomething(url) {
  console.log(url);
}

const arr = [
  "/hello.",
  "/hello",
  "/hello.html",
  "/hello....",
  "/hello/html",
  "/hellohtml",
];

for (let i = 0; i < arr.length; i++) {
  toRoute(arr[i]);
}
