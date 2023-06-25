import { useState } from "react";
import React from "react";
import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid"

import "../styles/modal.css"

interface pageProps {
    readonly isOpen: boolean,
    readonly toggleOpen: Function,
    readonly uri: string,
    readonly databaseToWriteTo: string,
    readonly name?: string,
    readonly dataset?: string,
}

interface formData {
    description?: string|undefined,
    cause?: string|undefined,
    type?:string,
    date?: string|undefined
  }

export default function AddDamageModal(props:pageProps) {
    const queryEngine = new QueryEngine()

    const [dropdownActive, setDropdownActive] = useState<boolean>(false)
    const [damageType, setDamageType] = useState<string>("damage")
    const [formInput, setFormInput] = useState<formData>({
        description: "Gerboken glas-in-lood raam.",
        cause: "Blootstelling aan de buitenwereld.",
        date: (new Date()).toString()
    })

    async function sendForm() {
        if(!props.uri || !props.databaseToWriteTo) {console.log("the URI or database was not found!"); return}
        let uri = props.uri
        let databaseUrl = props.databaseToWriteTo
        if (!formInput.description && !formInput.cause && !formInput.date) {console.log("you should at least provide some information"); return}

        const projectDataset =  props.dataset

        formInput.type = damageType
        console.log(formInput)

        let damageClass:string = "dot:Damage"
        let currentDate = new Date()

        if (formInput.type === "damage pattern") {damageClass = "dot:DamagePattern"}
        if (formInput.type === "area damage") {damageClass = "dot:DamageArea"}
        if (formInput.type === "damaged element") {damageClass = "dot:DamageElement"}

        let damageId:string|undefined = databaseUrl + "#damage_" + (Math.floor(Math.random() * 1000000))
        let causeId:string|undefined = databaseUrl + "#cause_" + (Math.floor(Math.random() * 1000000))
        let originId:string|undefined = databaseUrl + "#origin_" + (Math.floor(Math.random() * 1000000))

        await queryEngine.queryVoid(`
            PREFIX dot: <https://w3id.org/dot#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
            PREFIX dct: <http://purl.org/dc/terms/>

            INSERT DATA {
            ${projectDataset? `<${projectDataset}> dct:hasPart <${damageId}>.`: ""}
            
            <${uri}> dot:hasDamage <${damageId}>.

            <${damageId}> a ${damageClass};
                rdfs:comment "${formInput.description}";
                dcterms:date "${formInput.date}";
                dot:hasCausation <${causeId}>;
                mifestoRM:hasOrigin <${originId}>.

            <${causeId}> a dot:Causation;
            rdfs:comment "${formInput.cause}".

            <${originId}> a mifestoRM:Origin;
            mifestoRM:addedOn "${currentDate}".
            }
        `, {sources: [databaseUrl]})

        window.location.reload()
    }

    return <div className={props.isOpen? "modalBackground positionAbsolute": "hidden positionAbsolute"}>
        <div className="modal">
            <form action="#">
                <h1>Create a damage instance for:</h1>
                <h1>{props.name? props.name: props.uri}</h1>

                <label>Description</label>
                <input type="text" defaultValue={"Gerboken glas-in-lood raam."} placeholder="A fitting description..." onChange={(event) => {formInput.description = event.target.value}} />

                <label>Causation</label>
                <input type="text" defaultValue={"Blootstelling aan de buitenwereld."} placeholder="The cause of the damage" onChange={(event) => {formInput.cause = event.target.value}} />

                <label>Type</label>
                
                <div className="dropdown" >
                    <input type="text" id="dropdownSwitch" placeholder={damageType} readOnly onClick={() => {setDropdownActive(true)}}/>
                    <div className={dropdownActive? "dropdownOptions opacity100" : "dropdownOptions"} onMouseLeave={() => setDropdownActive(false)}>
                        <input type="text" defaultValue={"damage pattern"} readOnly onClick={() => {setDamageType("damage pattern"); setDropdownActive(false)}}/>
                        <input type="text" defaultValue={"area damage"} readOnly onClick={() => {setDamageType("area damage"); setDropdownActive(false)}}/>
                        <input type="text" defaultValue={"damaged element"} readOnly onClick={() => {setDamageType("damaged element"); setDropdownActive(false)}}/>
                    </div>
                </div>

                <label>Noticed on</label>
                <input type="date" onChange={(event) => {formInput.date = event.target.value}}/>

                <div className="buttonRow">
                    <button type="reset" onClick={() => {setDamageType("damage"); props.toggleOpen(false) }}>cancel</button>
                    <button type="submit" className="submitButton" onClick={(event) => {event.preventDefault(); sendForm(); setDamageType("damage"); props.toggleOpen(false)}}>send</button>
                </div>
            </form>
        </div>
    </div>
}