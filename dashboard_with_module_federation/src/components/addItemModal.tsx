import React, {useState} from "react";
import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid";

interface pageProps {
    isAddModalOpen:boolean,
    setIsAddModalOpen:Function,
    dataset: string|undefined,
    database: string|undefined,
    projectName?: string
}

interface formDetails {
    label: string,
    desc: string
}

export default function AddItemModal(props:pageProps) {

    const queryEngine = new QueryEngine()
    const [formDetails, setFormDetails] = useState<formDetails>({
        label: "",
        desc: "",
    })

    async function addConceptItem() {
        if(!props.dataset || !props.database || formDetails.label === "") return

        let conceptId:string|undefined = props.database + "#concept_" + (Math.floor(Math.random() * 1000000))
        let originId:string|undefined = props.database + "#origin_dashboard_" + (Math.floor(Math.random() * 1000000))
        let currentDate = new Date()

        await queryEngine.queryVoid(`
            PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dct: <http://purl.org/dc/terms/>

            INSERT DATA {
                <${props.dataset}> dct:hasPart <${conceptId}>.

                <${conceptId}> a mifestoRM:LinksetConcept;
                    rdfs:label "${formDetails.label}";
                    rdfs:comment "${formDetails.desc}";
                    mifestoRM:hasOrigin <${originId}>.
                
                <${originId}> a mifestoRM:Origin;
                    mifestoRM:addedOn "${currentDate}";
                    mifestoRM:originatesFrom "http://localhost:3000/project?url=http://localhost:5100/Tester/projects/dummyProject&iri=project".
            }
        `, {
            sources: [props.dataset]
        })
    }

    function handleChange(event:React.ChangeEvent<HTMLInputElement>, prop:string) {
        event.preventDefault()

        // console.log(event.target.value)
        formDetails[prop] = event.target.value
    }

    function reset() {
        setFormDetails({
            label: "",
            desc: ""
        })

        props.setIsAddModalOpen(false)
    }

    return <div className={props.isAddModalOpen? "positionAbsolute modalBackground": "positionAbsolute hidden"}>
    <div className="modal">
        <span onClick={() => props.setIsAddModalOpen(false)} >x</span>
        <h1>Add new concept</h1>
        <p>to {(props.projectName)? props.projectName: props.dataset}</p>

        <form onSubmit={(event) => {event.preventDefault(); addConceptItem(); reset()}}>
            <label>Label:</label>
            <input onChange={(event) => {handleChange(event, "label")}} type="text" placeholder="A name for the concept e.g. door_hall_livingroom"/>

            <label>Description:</label>
            <input onChange={(event) => {handleChange(event, "desc")}} type="text" placeholder='A fitting description for the concept e.g. "this is the door between the main hall and the living room"'/>

            <div>
                <button type="reset" onClick={() => reset()}>Cancel</button>
                <button type="submit">Add</button>
            </div>                    
        </form>
    </div>
</div>
}