import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom"
import { Session } from "@inrupt/solid-client-authn-browser"

interface pageProps {
    session:Session,
}

export default function ReroutePage(props:pageProps) {
    const navigate = useNavigate()

    const rerouteUrl = window.localStorage.getItem("rerouteUrl")

    useEffect(() => {
        handleRedirect()
        if(rerouteUrl) {
            const newUrl = new URL(rerouteUrl)
            const rerouteString = newUrl.pathname + newUrl.searchParams
            navigate(rerouteString)
        }
    
        if(!rerouteUrl) {
            navigate("/")
        }
    }, [])

    async function handleRedirect() {
        await props.session.handleIncomingRedirect({restorePreviousSession: !props.session.info.isLoggedIn})
    }

    return null
}