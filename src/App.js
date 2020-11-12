import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import './App.css';
import View from './components/View.js'
import Login from "./components/Login";

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
