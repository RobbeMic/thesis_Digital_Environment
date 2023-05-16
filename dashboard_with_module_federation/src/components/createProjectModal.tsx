import React, { useState } from "react";
import { Session } from "@inrupt/solid-client-authn-browser"
import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid"
import { useNavigate } from "react-router-dom"

import "../styles/modal.css"

interface pageProps {
    session:Session,
    isModalOpen: boolean,
    setIsModalOpen: Function,
    setPageHeader: Function
}

interface formDetails {
    podServer: string,
    projectName: string,
    description: string,
    otherDataset?: string
}

export default function CreateProjectModal(props: pageProps) {

    const queryEngine = new QueryEngine()
    const navigate = useNavigate()

    const [formDetails, setFormDetails] = useState<formDetails>({
        podServer: "http://localhost:5100/Tester/",
        projectName: "",
        description: ""
    })

    function reroute(name:string, url:string, iri:string) {
        props.setPageHeader(name)
        navigate(`/project?url=${url}&iri=${iri}`)
    }

    async function createNewProject() {

        if(formDetails.podServer === "" || formDetails.projectName === "" || !props.session.info.webId) return

        const profileUri = new URL(props.session.info.webId)

        const profileUrl = profileUri.href.replace(profileUri.hash, "")

        const podServer = new URL(formDetails.podServer)
        if(!podServer || !podServer.origin || !podServer.host) return

        const newFileName = formDetails.projectName.replace(" ", "_")

        await queryEngine.queryVoid(`
            PREFIX consolid: <https://w3id.org/consolid#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>
            PREFIX bot: <https://w3id.org/bot#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            INSERT DATA {
                <${podServer + "projects/" + newFileName + "#" + newFileName}> a consolid:Project;
                    dct:title "${formDetails.projectName}";
                    dcat:dataset <${podServer + "projects/" + newFileName}#_1>.
                
                <${podServer + "projects/" + newFileName}#_1> a dcat:Dataset;
                    dct:hasPart <${podServer + "projects/" + newFileName}#_site1>, <${podServer + "projects/" + newFileName}#_building1>.

                <${podServer + "projects/" + newFileName}#_site1> a bot:Site;
                    rdfs:label "site";
                    bot:hasBuilding <${podServer + "projects/" + newFileName}#_building1>.
                
                <${podServer + "projects/" + newFileName}#_building1> a bot:Building;
                    rdfs:label "building".
            }
        `, {
            sources: [profileUrl],
            destination: {type: 'patchSparqlUpdate', value: podServer + "projects/" + newFileName + "#36.ttl"},
            '@comunica/actor-http-inrupt-solid-client-authn:session': props.session
        })

        await queryEngine.queryVoid(`
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>

            INSERT DATA {
                <${profileUrl + "#listOfProjects"}> a dcat:Catalog;
                    dct:hasPart <${podServer + "projects/" + newFileName + "#" + newFileName}>.
            }
        `, {
            sources: [profileUrl],
            '@comunica/actor-http-inrupt-solid-client-authn:session': props.session
        })

        reset()
        props.setIsModalOpen(false)

        reroute(formDetails.projectName, podServer + "projects/" + newFileName, newFileName)
    }

    function handleChange(event:React.ChangeEvent<HTMLInputElement>, prop:string) {
        event.preventDefault()

        formDetails[prop] = event.target.value
    }

    function reset() {
        setFormDetails({
            podServer: "http://localhost:5100/Tester/",
            projectName: "",
            description: ""
        })
    }

    return <div className={props.isModalOpen? "positionAbsolute modalBackground": "positionAbsolute hidden"}>
        <div className="modal">
            <h1>Create new project</h1>

            <form onReset={() => {reset(); props.setIsModalOpen(false)}} onSubmit={(event) => {event.preventDefault(); createNewProject()}}>
                <label >Pod server:</label>
                <input type="text" onChange={(event) => {handleChange(event, "podServer")}} defaultValue={"http://localhost:5100/Tester/"} />

                <label >Project Name:</label>
                <input type="text" onChange={(event) => {handleChange(event, "projectName")}} placeholder="the name of the new project, prefferably a unique name" />

                <label >Description:</label>
                <input type="text" onChange={(event) => {handleChange(event, "description")}} placeholder="a short description of the project" />

                <label >Already existing dataset:</label>
                <input type="text" onChange={(event) => {handleChange(event, "otherDataset")}} placeholder="an already existing dataset (currently multiple sources not jet supported)"/>

                <div>
                    <button type="reset">Cancel</button>
                    <button type="submit">Create</button>
                </div>
            </form>

        </div>
    </div>
}