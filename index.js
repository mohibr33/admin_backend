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
const connection = mysql.createConnection({
  host: '192.168.123.186',
  port: 3306,
  user: 'homepageuser',
  password: "homepageuser@123",
  database: 'homepageapp',
});

app.get("/", (req, res) => {
  console.log('Backend server is running');
  return res.send("ok");
})


app.post("/auth",(req,res) => {
    let {email, password} = req.body
    if(!email || !password) return res.send( "Email & Password are Required");
    let q1 = `SELECT * from users WHERE email = ${email} LIMIT 1`;
    connection.query(
        q1,
        function (err, results) {
        if(err) return res.send(err);
        if(results.length < 1) return res.status(404).json({ error: 'Email or Password is incorrect.' });
        bcrypt.compare(password, results[0].password, function(err, result) {
                if(!result) return res.status(402).json({error: 'Incorrect Password'})
                let token = jwt.sign({ id: results[0].id,}, 'zetatechaaa');
                res.send(token)
        });

        }
      );
});



app.post("/addinguser", function (req, res) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('email, and password are required.');
  }
  const q2 = `INSERT INTO added (email,password) VALUES ('${req.body.email}', '${req.body.password}')`;
  connection.query(
    q2,
    function (err, results) {
      if (err) {
        console.error('Error adding user:', err);
        return res.status(500).send('Error adding user.'); s
      }
      res.status(201).send('User added successfully!');
    })
});



app.listen(8080, () => console.log("App Running on Port [8080]"))