const firebase = require("../firebase-init");

let database = require("../database");
// signup
exports.signup = (req, res) => {
  if (!req.body.email || !req.body.password) {
    console.log(req.body);
    return res.status(422).json({
      email: "email is required",
      password: "password is required",
    });
  }
  firebase
    .auth()
    .createUserWithEmailAndPassword(req.body.email, req.body.password)
    .then((user) => {
      req.body.uid = user.user.uid;
      delete req.body.password;
      users.addUser(req.body, user.user.uid);
      return res.status(200).json({ status: user });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode == "auth/weak-password") {
        return res.status(500).json({ error: errorMessage });
      } else {
        return res.status(500).json({ error: errorMessage });
      }
    });
};

// signin
exports.signin = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(422).json({
      email: "email is required",
      password: "password is required",
    });
  }
  firebase
    .auth()
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then((user) => {
      users.addUser(req.body);
      return res.status(200).json({ status: user });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode === "auth/wrong-password") {
        return res.status(500).json({ error: errorMessage });
      } else {
        return res.status(500).json({ error: errorMessage });
      }
    });
};

// verify email
// this work after signup & signin
exports.verifyEmail = (req, res) => {
  firebase
    .auth()
    .currentUser.sendEmailVerification()
    .then(function () {
      return res.status(200).json({ status: "Email Verification Sent!" });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode === "auth/too-many-requests") {
        return res.status(500).json({ error: errorMessage });
      }
    });
};

// forget password
exports.forgetPassword = (req, res) => {
  if (!req.body.email) {
    return res.status(422).json({ email: "email is required" });
  }
  firebase
    .auth()
    .sendPasswordResetEmail(req.body.email)
    .then(function () {
      return res.status(200).json({ status: "Password Reset Email Sent" });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode == "auth/invalid-email") {
        return res.status(500).json({ error: errorMessage });
      } else if (errorCode == "auth/user-not-found") {
        return res.status(500).json({ error: errorMessage });
      }
    });
};

exports.updateUser = (req, res) => {
  const user = firebase.auth().currentUser;
  try{
    users.addUser(req.body,req.body.uid);
  }
  catch(e){
    throw new e;
  }

};

exports.deleteUser = (req, res) => {
  const user = firebase.auth().currentUser;

  user
    .delete()
    .then(() => {
      req.body.uid = user.uid;
      delete req.body.password;
      users.deleteUser(req.body, user.uid);
      return res.status(200).json({ status: "Deleted" });
    })
    .catch((error) => {
      console.log(error);
      res.json(400);
    });
};

exports.getUser = async (req, res) => {
  console.log(req.body)
  try {
    database
      .ref("users")
      .once("value")
      .then(function (snapshot) {
        let users = snapshot.val();

        let uid = req.body.uid;
        console.log(uid);
        if (!users[uid]) return false;

        u = users[uid];
        return res.status(200).json({ status: u });
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    res.json(400);
    throw new e();
  }
};


exports.getUserByName = async (req, res) => {
  console.log(req.body)
  try {
    database
      .ref("users")
      .once("value")
      .then(function (snapshot) {
        let users = snapshot.val();

        let name = Tools.toId(req.body.name);
        console.log(name);
        let results = [];
      try {
        let keys = Object.keys(users);
        for(let i = 0;i < keys.length;i++) {
          console.log(users[keys[i]])
          let n = Tools.toId(users[keys[i]].fname + users[keys[i]].lname)
          if(n.includes(name)) results.push(users[keys[i]]);

          console.log(n);
          console.log(results);
        }
      } 
      catch(e) {
        console.log(e)
      }
        return res.status(200).json({ status: results });
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    res.json(400);
    throw new e();
  }
};


exports.getUsers = async (req, res) => {
  console.log(req.body)
  try {
    database
      .ref("users")
      .once("value")
      .then(function (snapshot) {
        let users = snapshot.val();

        return res.status(200).json({ users: Object.values(users) });
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    res.json(400);
    throw new e();
  }
};