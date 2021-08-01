const Koa = require("koa");
const router = require("koa-router")();
const bodyParser = require("koa-bodyparser");
const app = new Koa();
app.use(bodyParser());

const firebase = require("firebase");

// const firebaseConfig = {
//   apiKey: "AIzaSyCHITjVbK6NQldafzqpxj-0aZ9ZxWgZRG0",
//   authDomain: "reddit-task-35480.firebaseapp.com",
//   projectId: "reddit-task-35480",
//   storageBucket: "reddit-task-35480.appspot.com",
//   messagingSenderId: "574087501468",
//   appId: "1:574087501468:web:e7186f74a41f443b0d7f59",
//   databaseURL:
//     "https://reddit-task-35480-default-rtdb.europe-west1.firebasedatabase.app",
// };

// firebase.initializeApp(firebaseConfig);

let database = firebase.database();

router.get("/comments", async (ctx, next) => {
  await database
    .ref()
    .child("comments")
    .orderByChild("threadId")
    .equalTo(ctx.query.threadId)
    .on("value", (snapshot) => {
      if (snapshot.exists()) {
        ctx.body = Object.values(snapshot.val());
      } else {
        console.log("No data available");
      }
    });

  await next();
});

router.post("/comments", async (ctx, next) => {
  await database
    .ref("comments/" + ctx.request.body.id)
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

  let currentThread;
  await database
    .ref("threads/" + ctx.request.body.threadId)
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        currentThread = {
          ...snapshot.val(),
          commentsAmmount: snapshot.val().commentsAmmount
            ? snapshot.val().commentsAmmount + 1
            : 1,
        };
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  await database
    .ref("threads/" + ctx.request.body.threadId)
    .set(currentThread, function (error) {
      if (error) {
        // The write failed...
        console.log("Failed with error: " + error);
      } else {
        // The write was successful...
        console.log("success");
      }
    });

  await next();
});

router.put("/comments/update-score", async (ctx, next) => {
  let currentComment;
  await database
    .ref("comments/" + ctx.request.body.id)
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        currentComment = {
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
    .ref("comments/" + ctx.request.body.id)
    .set(currentComment, function (error) {
      if (error) {
        // The write failed...
        console.log("Failed with error: " + error);
      } else {
        // The write was successful...
        console.log("success");
        ctx.body = currentComment;
      }
    });

  await next();
});

app.use(router.routes()); // route middleware
module.exports = app;
