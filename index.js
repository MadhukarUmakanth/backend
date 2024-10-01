const express = require('express');
const cors = require('cors');

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const path = require('path')
const app = express();
app.use(cors())
app.use(express.json())


const dbPath = path.join(__dirname,"addusers.db")
let db = null

const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      app.listen(5000, () => {
        console.log("Server Running at http://localhost:5000/");
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };
  
  initializeDBAndServer();
  app.post("/signup", async(request,response) =>{
    const {username,email,password} = request.body; 
    console.log(username);
    const hashedPassword = await bcrypt.hash(password,10);
    const selectUserQuery = `SELECT * FROM users WHERE username = '${username}';`;
    const dbUser = await db.get(selectUserQuery);

    if (dbUser === undefined){
      const addusers = `
      INSERT INTO 
        users (username,password,email)
      VALUES
        (
        '${username}',
        '${hashedPassword}',
        '${email}'
      );`;
    await db.run(addusers);
    response.send("useradded successfully");

    }else{
      response.status(400);
      response.send("User Already Exists");

    }
  })
    
app.post("/login",async(request,response) => {
  const {username,password} = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined){
    response.status(400);
    response.send("Invalid User!")
  }else {
    const isPasswordMatched = await bcrypt.compare(password,dbUser.password);

    if (isPasswordMatched === true) {
      response.status(200)
      response.send("Login Successful !")
    }
    else{
      response.status(400);
      response.send("Invaild Password")
    }

  }
      
});