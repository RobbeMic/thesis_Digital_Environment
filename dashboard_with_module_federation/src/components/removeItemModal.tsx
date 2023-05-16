import React from "react";

import { QueryEngine } from "@comunica/query-sparql";

import "../styles/modal.css"

interface pageProps {
    isRemoveModalOpen:boolean,
    setIsRemoveModalOpen:Function,
    item?: itemProps,
    dataset: string|undefined,
    database: string|undefined
}

interface itemProps {
    class: string,
    uri: string,
    label?: string,
    properties?: itemProps[],
}

export default function RemoveItemModal(props:pageProps) {

    const queryEngine = new QueryEngine()

    async function removeItem(item:itemProps|undefined) {
        if(!item || !props.database || !props.dataset) return
        
        console.log("removing " + ((item.label)? item.label: item.uri))

        await queryEngine.queryVoid(`
            PREFIX dct: <http://purl.org/dc/terms/>

            DELETE {
                <${props.dataset}> dct:hasPart <${item.uri}>.

                <${item.uri}> ?p ?o.
            }
            WHERE {
                <${item.uri}> ?p ?o.
            }
        `, {
            sources: [props.database]
        })
    }

    return <div className={props.isRemoveModalOpen? "positionAbsolute modalBackground": "positionAbsolute hidden"} >
        <div className="modal">
            <h1>Are you sure you want to remove {(props.item?.label)? props.item.label: props.item?.uri}?</h1>
            <p>{props.item?.uri}</p>
            <div>
                <button onClick={() => {props.setIsRemoveModalOpen(false)}}>Cancel</button>
                <button onClick={() => {removeItem(props.item); props.setIsRemoveModalOpen(false)}}>Delete</button>
            </div>
        </div>
    </div>
}