import React, { useState, useMemo } from "react";

import { Session } from "@inrupt/solid-client-authn-browser";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./components/navBar";
import Login from "./pages/login";
import Person from "./pages/person";
import ProjectPage from "./pages/project";

export default function Layout() {
    const [pageHeader, setPageHeader] = useState<string|undefined>(undefined)

    let currentSession = useMemo(() => {
        // console.log("Creating a new session!")
        
        const savedSessionString:string|null = window.localStorage.getItem("session")
        if(!savedSessionString) {
            console.log("Creating a new session!")
            const newSession = new Session()
            return newSession
        }

        console.log("fetching previous session!")

        const savedSession = JSON.parse(savedSessionString)
        console.log(savedSession)
        
        const newSession = new Session({sessionInfo:savedSession})
        // const newSession = new Session()
        return newSession
    }, [])


    return <BrowserRouter>
        <NavBar pageHeader={pageHeader} setPageHeader={setPageHeader} session={currentSession}/>
        <Routes>
            <Route path="/" element={<Login pageHeader="login page" setPageHeader={setPageHeader}/>} />
            <Route path="/test" element={<div>test test</div>} />
            <Route path="/person" element={<Person pageHeader="person" setPageHeader={setPageHeader} session={currentSession}/>} />
            <Route path="/project" element={<ProjectPage pageHeader={pageHeader} setPageHeader={setPageHeader} session={currentSession}/>} />
        </Routes>
    </BrowserRouter>
}