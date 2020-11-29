// https://serverless-stack.com/chapters/create-a-login-page.html
import React, { Component } from "react";
import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { Redirect } from 'react-router-dom';
// import "./Login.css";
import axios from 'axios';

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
    const res = await axios.post("http://localhost:5000/api/login", userData, {});
    if(res.data.status === 200)
      {
        this.setState({
          status : 'CORRECT'
        })
      }
      else{
        this.setState({
          status : 'FALSE'
        })
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
    if(this.state.status == "CORRECT"){
      return <Redirect to="/lipsync" />
    }
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