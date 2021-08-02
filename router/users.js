const Koa = require("koa");
const router = require("koa-router")();
const bodyParser = require("koa-bodyparser");
const app = new Koa();
app.use(bodyParser());

const firebase = require("firebase");

let database = firebase.database();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    err.status = err.statusCode || err.status || 500;
    ctx.body = "400";
  }
});

router.get("/users", async (ctx, next) => {
  await database
    .ref()
    .child("users")
    .orderByChild("name")
    .equalTo(ctx.query.name)
    .on("value", (snapshot) => {
      if (snapshot.exists()) {
        ctx.body = snapshot.val();
      } else {
        console.log("No data available");
      }
    });

  await next();
});

router.post("/users", async (ctx, next) => {
  try {
    await database
      .ref("users/" + ctx.request.body.name)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          throw new Error("User already exists");
        }
      });

    await database
      .ref("users/" + ctx.request.body.name)
      .set(ctx.request.body, function (error) {
        if (error) {
          // The write failed...
          console.log("Failed with error: " + error);
        } else {
          // The write was successful...
          console.log("success");
          ctx.body = ctx.request.body;
        }
      });

    await next();
  } catch (err) {
    ctx.status = err.status || 400;
    ctx.body = err.message;
    ctx.app.emit("error", err, ctx);
  }
});

app.use(router.routes()); // route middleware
module.exports = app;
