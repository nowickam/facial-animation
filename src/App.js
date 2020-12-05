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


function App() {
  const [logged] = useAuth();
  console.log(logged)

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          {!logged && <>
          <Route path="/">
            <Login />
          </Route>
          <Redirect to="/"/>
          </>}
          {logged && <>
          <Route path="/lipsync">
            <View />
          </Route>
          <Redirect to="/lipsync"/>
          </>}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
