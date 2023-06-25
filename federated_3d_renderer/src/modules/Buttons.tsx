import React, { useState } from "react";

import { QueryEngine } from "@comunica/query-sparql-solid";

import AddGeomModal from "../components/AddGeomModal";

// interface pageProps {
//     readonly selectedItem?: itemProps,
//     readonly dataSet:string,
// }

interface itemProps {
    class: string,
    uri: string,
    label?: string,
    properties?: itemProps[],
}

interface passedProps {
    [key: string]: any,
}

export default function Buttons(props:passedProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)

    const queryEngine = new QueryEngine()

    async function removeModelfromGraph() {
        if(!props.variableProps.item || !props.variableProps.item.uri || !props.variableProps.database) return

        console.log("removing model!")

        await queryEngine.queryVoid(`
        PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
        PREFIX inst: <http://localhost:5000/Tester/ontology/inst#>

        DELETE {
            <${props.variableProps.item.uri}> inst:hasGltf ?model.
        }

        WHERE {
            <${props.variableProps.item.uri}> inst:hasGltf ?model.
        }
        `, {
            sources:[props.variableProps.database]
        })

        window.location.reload()
    }

    return <div>
        <button onClick={() => {setIsAddModalOpen(true)}} >Add geometry</button>
        <button onClick={() => {
            if(window.confirm("Are you sure you want to remove the model?")) {
                console.log(props.variableProps)
                removeModelfromGraph()
            }
        }} >Remove geometry</button>
        <AddGeomModal 
            selectedItem={props.variableProps.item} 
            dataSet={props.variableProps.database} 
            open={isAddModalOpen} 
            setOpen={setIsAddModalOpen} 
            // modelList={}
            // setModelList={}
        />
    </div>
}