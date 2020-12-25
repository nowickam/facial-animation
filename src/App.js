import React, {useState} from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import './App.css';
import View from './components/View.js'
import Login from "./components/Login";

import {login, authFetch, useAuth, logout} from "./auth"


function App() {
  const [logged] = useAuth();
  const [theme, setTheme] = useState('dark');

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
            <View theme={theme} setTheme={setTheme}/>
          </Route>
          <Redirect to="/lipsync"/>
          </>}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
