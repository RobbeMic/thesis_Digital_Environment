import React, { useState } from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./styles/index.css";
import Layout from "./Layout";

const App = () => (
  <Layout/>
);
// ReactDOM.render(<App />, document.getElementById("app"));
const root = createRoot(document.getElementById("app"))
root.render(<App />)
