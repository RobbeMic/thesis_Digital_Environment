import React, { useState, useEffect } from "react";
import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid";

import "../styles/index.css"

import ButtonRow from "../modules/buttonRow";

export default function LandingPage() {
    const queryEngine = new QueryEngine()

    const [itemUri, setItemUri] = useState<string>("http://localhost:5100/Tester/projects/dummyProject#_001")
    const [itemName, setItemName] = useState<string>("not found yet")

    useEffect(() => {
        getItemName(itemUri)
    }, [])

    async function getItemName(Uri:string) {
        if(!Uri) return

        const queryBindings = await queryEngine.queryBindings(`
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

        SELECT ?label
        WHERE {
            <${Uri}> rdfs:label ?label.
        }
        `, {
            sources: [Uri]
        })

        let foundName:string

        queryBindings.on('data', (binding) => {
            if(binding.get('label').value) {
                foundName = binding.get('label').value
                setItemName(foundName)
            }
        })

        queryBindings.on('end', () => {
            console.log(foundName)
        })
    }

    return <div className="container">
        <div>Name: federated_damage_annotator</div>
        <div>Framework: react</div>
        <div>Language: TypeScript</div>
        <div>CSS: Empty CSS</div>

        <input type="text" defaultValue={itemUri} onChange={(event) => {setItemUri(event.target.value); getItemName(event.target.value)}} />

        <button onClick={() => {console.log(itemUri)}}>test</button>

        <ButtonRow itemUri={itemUri} itemName={itemName}/>
    </div>
}