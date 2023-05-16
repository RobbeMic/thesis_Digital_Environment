import React, { useState } from "react";

import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid";
import { FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi"

import AddDamageModal from "./addDamageModal";

import "../styles/buttons.css"

interface formData {
    description?: string|undefined,
    cause?: string|undefined,
    type?:string,
    date?: string|undefined
}

// interface pageProps {
//     itemUri: string,
//     itemName: string
// }

interface passedProps {
    [key: string]: any,
}

export default function ButtonRow(props:passedProps) {
    const queryEngine = new QueryEngine()

    const [addDamageModalActive, setAddDamageModalActive] = useState<boolean>(false)


    return <div className="buttonContainer">
        <button 
            disabled={!props.variableProps.item || !props.variableProps.item.uri || !props.variableProps.database} 
            onClick={() => {setAddDamageModalActive(!addDamageModalActive)}} > 
                <FiPlus/> 
                <p>add damage instance</p>
            </button>

        <button 
            disabled={!props.variableProps.item || !props.variableProps.item.uri || !props.variableProps.database}>
                <FiEdit3/> 
                <p>edit damage instance</p>
            </button>

        <button 
            disabled={!props.variableProps.item || !props.variableProps.item.uri || !props.variableProps.database} 
            onClick={() => {console.log(props); console.log(props.variableProps.itemUri); console.log(props.variableProps.itemName)}} > 
                <FiTrash2/> 
                <p>remove damage instance</p>
            </button>

        <AddDamageModal isOpen={addDamageModalActive} toggleOpen={setAddDamageModalActive} databaseToWriteTo={props.variableProps.database} uri={props.variableProps.item?.uri} name={props.variableProps.item?.label} dataset={props.variableProps.dataset} />
    </div>
}