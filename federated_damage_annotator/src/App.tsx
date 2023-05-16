import React from "react";
import ReactDOM from "react-dom";

import "./styles/index.css";
import { useState } from "react";

import LandingPage from "./pages/landingPage";

const App = () => (
  <LandingPage/>
);
ReactDOM.render(<App />, document.getElementById("app"));
