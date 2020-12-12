// https://serverless-stack.com/chapters/create-a-login-page.html
import React, { Component } from "react";
import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import "./Login.css";
import axios from "axios";
import { login, authFetch, useAuth, logout } from "../auth";
import { Transition } from "react-transition-group";
import { AUDIO_FRAME, FPS, transitionStyles, defaultStyle } from "../Config.js";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      mounted: false,
    };
    // const history = useHistory();
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
    const userData = JSON.stringify({
      username: this.state.username,
      password: this.state.password,
    });
    console.log(userData);
    const res = await axios.post("/api/login", userData, {});
    console.log(res);
    var token = res.data;
    if (token.access_token) {
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
                <div id="title">Audio-driven animation</div>
                <FormGroup
                  id="username"
                  className="form-element"
                  bssize="large"
                >
                  <FormLabel>Username</FormLabel>
                  <FormControl
                    id="username-form"
                    autoFocus
                    type="text"
                    value={this.state.username}
                    onChange={this.setUsername}
                  />
                </FormGroup>
                <FormGroup
                  id="password"
                  className="form-element"
                  bssize="large"
                >
                  <FormLabel>Password</FormLabel>
                  <FormControl
                    id="password-form"
                    value={this.state.password}
                    onChange={this.setPassword}
                    type="password"
                  />
                </FormGroup>
                <Button
                  id="login-button"
                  block
                  bssize="large"
                  disabled={!this.validateForm()}
                  type="submit"
                  onClick={this.validateData}
                >
                  Login
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
