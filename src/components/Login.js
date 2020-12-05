// https://serverless-stack.com/chapters/create-a-login-page.html
import React, { Component } from "react";
import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
// import "./Login.css";
import axios from 'axios';
import {login, authFetch, useAuth, logout} from "../auth"

class Login extends Component {
  constructor(props){
    super(props)
    this.state={
      username : "",
      password : "",
      status : "FALSE"
    }
  // const history = useHistory();
  this.validateForm = this.validateForm.bind(this)
  this.validateData = this.validateData.bind(this)
  this.setUsername = this.setUsername.bind(this)
  this.setPassword = this.setPassword.bind(this)
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  async validateData(){
    const userData = JSON.stringify({username : this.state.username, password : this.state.password})
    const res = await axios.post('/api/login', userData, {});
    var token = res.data
    if(token.access_token){
      login(token)
      console.log(token)
    }
    else{
      console.log("Please type in correct username/password")
    }
  }

  setUsername(e){
    this.setState({
      username: e.target.value
    })
  }

  setPassword(e){
    this.setState({
      password: e.target.value
    })
  }

  render(){
    return (
    <div className="Login">
      <form onSubmit={this.handleSubmit}>
        <FormGroup id="username" bssize="large">
          <FormLabel>Username</FormLabel>
          <FormControl
            id="username-form"
            autoFocus
            type="text"
            value={this.state.username}
            onChange={this.setUsername}
          />
        </FormGroup>
        <FormGroup id="password" bssize="large">
          <FormLabel>Password</FormLabel>
          <FormControl
            id="password-form"
            value={this.state.password}
            onChange={this.setPassword}
            type="password"
          />
        </FormGroup>
        <Button id="login-button" block bssize="large" disabled={!this.validateForm()} type="submit" onClick={this.validateData}>
          Login
        </Button>
      </form>
    </div>
  );
  }
}

export default Login;