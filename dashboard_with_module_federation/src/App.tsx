import React, { useState } from "react";
import ReactDOM from "react-dom";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./styles/index.css";
import Layout from "./Layout";

const App = () => (
  <Layout/>
);
ReactDOM.render(<App />, document.getElementById("app"));
