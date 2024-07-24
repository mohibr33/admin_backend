const express = require("express")
const jwt = require("jsonwebtoken")
const app = express()
const mysql = require('mysql2');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const cors = require("cors")
// bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash("mohib302", salt, function(err, hash) {
//         console.log(hash)
//     });
// });

app.use(express.json());
app.use(cors("*"))

// const connection = mysql.createConnection({
//   host: '192.168.123.186',
//   port: 3306,
//   user: 'homepageuser',
//   password: "homepageuser@123",
//   database: 'homepageapp',
// });


let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: '192.168.123.186',
    port: 3306,
    user: 'homepageuser',
    password: "homepageuser@123",
    database: 'homepageapp',
  });

  console.log('Connected to MySQL first time run');


  connection.connect(function (err) {
    if (err) {
      console.log('Error connecting to MySQL:', err);
      setTimeout(handleDisconnect, 2000); // Reconnect after 2 seconds
    } else {
      console.log('Connected to MySQL check if connected');
    }
    console.log('Connected to MySQL check in connected function');
  });

  connection.on('error', function (err) {
    console.log('MySQL error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconnect on connection loss
    } else {
      throw err;
    }
  });
  console.log('Connected to MySQL');
}

// Function to check connection status every 2 seconds
function checkConnection() {
  if (connection && connection.state !== 'disconnected') {
      console.log('MySQL is still connected');
  } else {
      console.log('MySQL is disconnected, attempting to reconnect...');
      handleDisconnect();
  }
}

handleDisconnect();

// Check the connection status every 2 seconds
setInterval(checkConnection, 3600000);


app.get("/", (req, res) => {
  console.log('Backend server is running');
  return res.send("ok");
})


app.post("/auth", (req, res) => {
  let { email, password } = req.body
  if (!email || !password) return res.send("Email & Password are Required");
  let q1 = `SELECT * from users WHERE email = ${email} LIMIT 1`;
  connection.query(
    q1,
    function (err, results) {
      if (err) return res.send(err);
      if (results.length < 1) return res.status(404).json({ error: 'Email or Password is incorrect.' });
      bcrypt.compare(password, results[0].password, function (err, result) {
        if (!result) return res.status(402).json({ error: 'Incorrect Password' })
        let token = jwt.sign({ id: results[0].id, }, 'zetatechaaa');
        res.send(token)
      });

    }
  );
});



app.post("/addinguser", function (req, res) {
  if (!req.body.email || !req.body.password || req.body.username || req.body.Role) {
    return res.status(400).send('email, username , role and password are required.');
  }
  bcrypt.hash(req.body.password, 10, function (err, hashedpassword) {
    if (err) {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).send('Error adding user.');
      }
    }
    const q2 = `INSERT INTO users (email,password,username,Role) VALUES ('${req.body.email}', '${hashedpassword}','${req.body.username}','${req.body.role}')`;
    connection.query(
      q2,
      function (err, results) {
        if (err) {
          console.error('Error adding user:', err);
          return res.status(500).send('Error adding user.'); s
        }
        res.status(201).send('User added successfully!');
      });
  });
});


app.put("/update", function (req, res) {
  const userid = req.body.id;
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const newUsername = req.body.username;
  const newRole = req.body.Role;
  const q4 = `UPDATE users SET email ='${req.body.email}' , password='${req.body.password}' ,username='${req.body.username}',Role='${req.body.role}'WHERE id = '${req.body.id}'`
  connection.query(
    q4,
    function (err, result) {
      if (err) {
        console.error('Error updating the user:', err);
        return res.status(500).send('Error updating user.');
      }
      res.status(200).send(result);
    }
  )
});


//changes
app.get("/allusers", function (req, res) {
  const q3 = 'SELECT * FROM users';
  connection.query(q3, function (err, results) {
    if (err) {
      console.error('Error getting users:', err);
      return res.status(500).send('Error getting users.');
    }
    res.status(200).send(results);
  });
});


//changes
app.delete("/deluser", function (req, res) {
  const userID = req.body.id;
  const q6 = `DELETE FROM users WHERE id=${req.body.id}`;
  connection.query(
    q6,
    function (err, result) {
      if (err) {
        console.error("Error deleting the user")
        return res.status(500).send("Error deleting user")
      }
      res.status(200).send("User Deleted Successfuly");
    }
  )
});


app.listen(8080, () => console.log("App Running on Port [8080]"))