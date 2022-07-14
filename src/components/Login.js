// https://serverless-stack.com/chapters/create-a-login-page.html
import React, { Component } from "react";
import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import "./css/Login.css";
import axios from "axios";
import { login, authFetch, useAuth, logout } from "../auth";
import { Transition } from "react-transition-group";
import { transitionStyles, defaultStyle } from "../Config.js";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      mounted: false,
    };
    this.validateForm = this.validateForm.bind(this);
    this.validateData = this.validateData.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
  }

  componentDidMount() {
    this.setState({
      mounted: true,
    });
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  async validateData() {
    // obtains the access token for valid credentials
    const userData = JSON.stringify({
      username: this.state.username,
      password: this.state.password,
    });
    const validUserData = JSON.stringify({
      username: '1',
      password: '1',
    });
    const res = await axios.post("http://localhost:5001/api/login", validUserData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
    var token = res.data;
    if (token.access_token) {
      this.setState({
        mounted: false
      })
      login(token);
      console.log(token);
    } else {
      console.log("Please type in correct username/password");
    }
  }

  setUsername(e) {
    this.setState({
      username: e.target.value,
    });
  }

  setPassword(e) {
    this.setState({
      password: e.target.value,
    });
  }

  render() {
    return (
      <Transition timeout={300} in={this.state.mounted}>
        {(state) => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
          >
            <div className="login">
              <form id="login-form" onSubmit={this.handleSubmit}>
                <div id="title">Audio-driven facial animation</div>
                {/* <FormGroup
                  id="username"
                  className="form-element"
                >
                  <FormLabel id="form-header">Username</FormLabel>
                  <FormControl
                    id="username-form"
                    className="form-element-input"
                    autoFocus
                    type="text"
                    value={this.state.username}
                    onChange={this.setUsername}
                  />
                </FormGroup>
                <FormGroup
                  id="password"
                  className="form-element"
                >
                  <FormLabel id="form-header">Password</FormLabel>
                  <FormControl
                    id="password-form"
                    className="form-element-input"
                    value={this.state.password}
                    onChange={this.setPassword}
                    type="password"
                  />
                </FormGroup> */}
                <Button
                  id="login-button"
                  block
                  // disabled={!this.validateForm()}
                  type="submit"
                  onClick={this.validateData}
                >
                  Start
                </Button>
              </form>
            </div>
          </div>
        )}
      </Transition>
    );
  }
}

export default Login;
