import React from "react";

interface pageProps {
    readonly pageHeader: string|undefined,    
}

export default function NavBar(props:pageProps) {
    return <div className="navBar">
        <h1>{props.pageHeader}</h1>
    </div>
}