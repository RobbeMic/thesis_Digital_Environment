import React from "react";

import '../styles/login.css'

import { Session } from '@inrupt/solid-client-authn-browser'

interface pageProps {
    readonly pageHeader: string,
    setPageHeader: Function,
    
}

export default function Login(props:pageProps) {
    const setPageHeader = props.setPageHeader
    let pageName = "page"
    if(props.pageHeader) {
        pageName = props.pageHeader
    }

    setPageHeader(pageName)

    const podProvider = "http://localhost:5000/"

    async function handleSolidLogin(event:React.FormEvent) {
        event.preventDefault()
    
        const session = new Session()
    
        await session.login({
          oidcIssuer: podProvider,
          clientName: "Robbe's personal website",
          redirectUrl: "http://localhost:3000/person"
        })
    
      }

    return(<div className="loginContainer">
        <form onSubmit={(event) => handleSolidLogin(event)}>
            <label>Solid-Pod Provider:</label>
            <input type="text" defaultValue={podProvider} />

            <button type="submit">Login</button>
        </form>
    </div>)
}