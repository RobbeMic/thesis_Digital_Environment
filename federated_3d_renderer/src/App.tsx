import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client"

import "./index.css";


import LandingPage from "./pages/landingPage";



const App = () => (
  <LandingPage/>
);
const root = createRoot(document.getElementById("app")!)
root.render(<App />);
