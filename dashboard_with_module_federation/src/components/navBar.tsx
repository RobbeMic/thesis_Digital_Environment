import React from "react";
import { IoExitOutline } from "react-icons/io5"
import { Session } from "@inrupt/solid-client-authn-browser";
import { useNavigate } from "react-router-dom";

interface pageProps {
    readonly pageHeader: string|undefined,
    setPageHeader: Function,
    session: Session,
}

export default function NavBar(props:pageProps) {
    const navigate = useNavigate()
    return <div className="navBar">
        <h1>{props.pageHeader}</h1>
        <h1 onClick={() => {
            console.log("logging out")
            props.session.logout()
            navigate("/")
        }}><IoExitOutline/></h1> 
    </div>
}