import React from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import './App.css';
import View from './components/View.js'
import Login from "./components/Login";

import {login, authFetch, useAuth, logout} from "./auth"


const PrivateRoute = ({ component: Component, ...rest }) => {
  const [logged] = useAuth();

  return <Route {...rest} render={(props) => (
    logged
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Route exact path="/">
          <Login />
        </Route>
        <Route exact path="/lipsync">
          <View />
        </Route>
      </BrowserRouter>
    </div>
  );
}

export default App;
