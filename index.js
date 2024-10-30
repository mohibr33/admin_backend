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

app.get('/user/:id', function (req, res) {
  const userId = req.params.id;
  const q4 = 'SELECT * FROM users WHERE id = ?';
  connection.query(q4, [userId], function (err, results) {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user.');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    res.status(200).send(results[0]);
  });
});

app.post("/auth", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email & Password are Required");
  }

  const q1 = 'SELECT * FROM users WHERE email = ?';
  connection.query(q1, [email], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length < 1) {
      return res.status(404).json({ error: 'Email or Password is incorrect.' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).send(err);
      if (!result) return res.status(401).json({ error: 'Incorrect Password' });

      const token = jwt.sign({ id: user.id }, 'zetatechaaa', { expiresIn: '1h' });
      const userData = {
        email: user.email,
        Role: user.Role
      };

      // console.log(userData);

      res.status(200).json({ token, user: userData });
    });
  });
});




//changes

app.post("/addinguser", function (req, res) {
  const { email, password, username, role } = req.body;

  if (!email || !password || !username || !role) {
    return res.status(400).send('Email, username, role, and password are required.');
  }

  bcrypt.hash(password, 10, function (err, hashedpassword) {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send(`Error hashing password: ${err.message}`);
    }

    const q2 = `INSERT INTO users (email, password, username, Role) VALUES (?, ?, ?, ?)`;
    connection.query(q2, [email, hashedpassword, username, role], function (err, results) {
      if (err) {
        console.error('Error adding user:', err);
        return res.status(500).send(`Error adding user: ${err.message}`);
      }
      res.status(201).send('User added successfully!');
    });
  });
});



//changes
app.put("/update/:id", function (req, res) {
  const userid = req.body.id;
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const newUsername = req.body.username;
  const newRole = req.body.role;

  // console.log('Updating user ', req.body);

  // Hash the new password
  bcrypt.hash(newPassword, 10, function (err, hashedPassword) {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error updating user.');
    }



    const q4 = `UPDATE users SET email = ?, password = ?, username = ?, Role = ? WHERE id = ?`;
    connection.query(
      q4,
      [newEmail, hashedPassword, newUsername, newRole, userid],
      function (err, result) {
        if (err) {
          console.error('Error updating the user:', err);
          return res.status(500).send('Error updating user.');
        }
        res.status(200).send(result);
      }
    );
  });
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
app.delete("/deluser/:id", function (req, res) {
  const userID = req.params.id;

  // Validate user ID (optional, but recommended)
  if (!userID || isNaN(userID)) {
    return res.status(400).send("Invalid user ID");
  }

  const q6 = `DELETE FROM users WHERE id=${connection.escape(userID)}`; // Escape user ID for security

  connection.query(
    q6,
    function (err, result) {
      if (err) {
        console.error("Error deleting the user:", err.message);
        return res.status(500).send("Error deleting user");
      }

      res.status(200).send("User Deleted Successfully");
    }
  );
});



app.listen(8080, () => console.log("App Running on Port [8080]"))