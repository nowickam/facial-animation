// https://serverless-stack.com/chapters/create-a-login-page.html
import React, { useState } from "react";
import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import { useHistory } from "react-router-dom";
// import "./Login.css";
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  function validateForm() {
    return username.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  async function validateData(){
    const userData = {"username" : username, "password" : password}
    const res = await axios.post("http://localhost:5000/login", userData, {});
    console.log(res)
    if(res.statusText === "OK")
      history.push('/lipsync');
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup id="username" bssize="large">
          <FormLabel>Username</FormLabel>
          <FormControl
            autoFocus
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </FormGroup>
        <FormGroup id="password" bssize="large">
          <FormLabel>Password</FormLabel>
          <FormControl
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
          />
        </FormGroup>
        <Button id="login-button" block bssize="large" disabled={!validateForm()} type="submit" onClick={validateData}>
          Login
        </Button>
      </form>
    </div>
  );
}