const Koa = require("koa");
const router = require("koa-router")();
const bodyParser = require("koa-bodyparser");
const app = new Koa();
app.use(bodyParser());

const firebase = require("firebase");



let database = firebase.database();

// Route to handle GET request
router.get("/threads", async (ctx, next) => {
  await database
    .ref()
    .child("threads")
    .orderByChild("created")
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        ctx.body = Object.values(snapshot.val());
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  await next();
});

router.get("/threads/:id", async (ctx, next) => {
  await database
    .ref(ctx.request.url)
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        ctx.body = snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  await next();
});

//  Route to handle POST request
router.post("/threads", async (ctx, next) => {
  await database
    .ref("threads/" + ctx.request.body.id)
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
});

router.put("/threads/update-score", async (ctx, next) => {
  let currentThread;
  await database
    .ref("threads/" + ctx.request.body.id)
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        currentThread = {
          ...snapshot.val(),
          score:
            ctx.request.body.type === "INCREMENT"
              ? snapshot.val().score + 1
              : snapshot.val().score - 1,
        };
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  await database
    .ref("threads/" + ctx.request.body.id)
    .set(currentThread, function (error) {
      if (error) {
        // The write failed...
        console.log("Failed with error: " + error);
      } else {
        // The write was successful...
        console.log("success");
        ctx.body = currentThread;
      }
    });

  await next();
});

//  Route to handle PUT request

app.use(router.routes()); // route middleware
module.exports = app;
