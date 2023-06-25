import React, { useState } from "react";

import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid";

import '../modal_styles.css'

interface pageProps {
    readonly selectedItem: itemProps,
    readonly dataSet:string,
    readonly open:boolean,
    readonly setOpen:Function,
    readonly modelList?:modelProps[]|null,
    readonly setModelList?:Function,
}

interface itemProps {
    class: string,
    uri: string,
    label?: string,
    properties?: itemProps[],
}

interface modelProps {
    item:itemProps,
    gltf:string,
}

export default function AddGeomModal(props:pageProps) {
    const [uploadForm, setUploadForm] = useState<boolean>(true)
    const [modelUrl, setModelUrl] = useState<string>("http://localhost:5100/Tester/models/raam_blender_test.glb")

    const queryEngine = new QueryEngine()

    async function addModelToGraph(URL:string) {
        if(!props.selectedItem) {
            window.alert("You should select an item to add the geometry to!")
            return
        }

        console.log(props.selectedItem)
        console.log(props.dataSet)
        console.log(URL)

        await queryEngine.queryVoid(`
        PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
        PREFIX inst: <http://localhost:5000/Tester/ontology/inst#>

        INSERT DATA {
            <${props.selectedItem.uri}> inst:hasGltf <${URL}>.
        }

        `, {
            sources:[props.dataSet]
        })

        props.setOpen(false)

        window.location.reload()
    }

    function handleInput(event:React.KeyboardEvent<HTMLInputElement>) {
        event.preventDefault()

        setModelUrl(event.currentTarget.innerText)
    }

    return <div className={props.open? "renderer_modalContainer": "renderer_hidden"}>
        <div className="renderer_modal">
            <button onClick={() => {props.setOpen(false)}} className="closeButton" >X</button>
            <div>
                <button onClick={() => {setUploadForm(true)}} className={uploadForm? "renderer_selected": ""} >Upload a model</button>
                <button onClick={() => {setUploadForm(false)}} className={uploadForm? "": "renderer_selected"} >Link a URL</button>
            </div>
            <form action="#" className={uploadForm? "": "renderer_hidden" } >
                <label>Upload a gltf model</label>
                <input type="file" name="gtlfModel" id="gtlfModel" />
            </form>
            <form onSubmit={(event) => {event.preventDefault(); addModelToGraph(modelUrl)}} className={uploadForm? "renderer_hidden": "" } >
                <label>Link a model through a URL</label>
                <input type="url" onKeyUp={(event) => {handleInput(event)}} defaultValue={modelUrl} />
                <button type="submit" >Add</button>
            </form>
        </div>
    </div>
}