const firebase = require("firebase");

const firebaseConfig = require('./config.js');
firebase.initializeApp(firebaseConfig);


// require packages
const Koa = require("koa");
const router = require("koa-router")();
const mount = require("koa-mount");
// create an instance of the Koa object
const app = new Koa();
const cors = require("@koa/cors");

app.use(cors());
// mount the route
app.use(mount(require("./router/threads.js")));
app.use(mount(require("./router/comments.js")));
app.use(mount(require("./router/users.js")));
// app.use(mount(require('./router/makeThreads.js')));
app.use(router.routes()); // route middleware





if (require.main === module) {
  app.listen(3001); // default
}

