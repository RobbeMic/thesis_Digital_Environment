import React, { useEffect, useState, useMemo } from "react";
import { Session } from "@inrupt/solid-client-authn-browser";
import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid"
import { QueryEngine as RegularQueryEngine } from "@comunica/query-sparql";

import "../styles/content.css"

import ModuleLoader from "../custom_hooks/loadDynamicComponent"

import ModuleStore from "../components/moduleStore";

import AddItemModal from "../components/addItemModal";
import RemoveItemModal from "../components/removeItemModal";

interface pageProps {
    readonly pageHeader: string|undefined,
    setPageHeader: Function,
    session:Session,
}

interface itemProps {
    class: string,
    uri: string,
    label?: string,
    properties?: itemProps[],
}

interface module {
    name: string,
    exposeUrl: string,
    moduleName: string,
    manifestUri: string,
}

interface passedProps {
    [key: string]: any,
}

export default function ProjectPage(props:pageProps) {
    const queryEngine = new QueryEngine()
    const secondQueryEngine = new RegularQueryEngine()
    const setPageHeader = props.setPageHeader

    // const [federatedButtons, setFederatedButtons] = useState<JSX.Element|undefined>()

    const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false)

    const [projectUrl, setProjectUrl] = useState<string>()
    // const [projectIri, setProjectIri] = useState<string>()
    const [projectDataset, setProjectDataset] = useState<string>()
    const [selectedItem, setSelectedItem] = useState<itemProps|undefined>()
    const [selectedViewer, setSelectedViewer] = useState<module|undefined>(undefined)
    const [selectedModule, setSelectedModule] = useState<module|undefined>(undefined)
    const [projectItemList, setProjectItemList] = useState<itemProps[]|undefined>(undefined)
    const [viewerList, setViewerList] = useState<module[]|undefined>(undefined)
    const [moduleList, setModuleList] = useState<module[]|undefined>(undefined)

    if(!props.pageHeader) {
        setPageHeader("...")
    }

    useEffect(() => {
        getUrlParams()
        getFunctionModuleList()
        getViewerModuleList()
        // getFederatedButtons("federated_damage_annotator", "./functions", "http://localhost:3200/remoteEntry.js")
    }, [])

    // const federatedButtons = useMemo(() => getFederatedButtons("federated_damage_annotator", "./functions", "http://localhost:3200/remoteEntry.js"), [selectedItem])

    // const buttonRows = useMemo(() => {
    //     if(!moduleList) return

    //     return moduleList.map((module) => {
    //         return getFederatedButtons(module.name, module.moduleName, module.exposeUrl)
    //     })
    // }, [moduleList])

    function buttonRows() {
        if(!moduleList) return

        return moduleList.map((module) => {
            return <div className={(selectedModule == module)? "": "hidden"}>
                {getFederatedButtons(module.name, module.moduleName, module.exposeUrl)}
            </div> 
        })
    }

    function getFederatedButtons(applicationName:string, applicationModule:string, applicationUrl:string) {

        const propsToPass:passedProps = {
            database: projectUrl,
            item: selectedItem,
            dataset: projectDataset,
            profile: props.session.info.webId,
        }

        // setFederatedButtons(<ModuleLoader url={applicationUrl} scope={applicationName} module={applicationModule} passedProps={propsToPass}/>)

        return <ModuleLoader url={applicationUrl} scope={applicationName} module={applicationModule} passedProps={propsToPass}/>
    }

    function viewerWindows(viewerList:module[]|undefined){
        if (!viewerList || viewerList.length == 0) return 

        return viewerList.map((viewerModule) => {
            const propsToPass:passedProps = {
                database: projectUrl,
                item: selectedItem,
                setItem: setSelectedItem
            }
            return <div className={(selectedViewer == viewerModule)? "full_width_height" : "hidden"} key={viewerModule.manifestUri} >
                <ModuleLoader url={viewerModule.exposeUrl} scope={viewerModule.name} module={viewerModule.moduleName} passedProps={propsToPass} />
            </div>
        })
    }

    async function getUrlParams() {
        const queryString = window.location.search

        if (queryString.length < 1) return
        const urlParams = new URLSearchParams(queryString)

        const projectUrl = urlParams.get('url')
        const projectIri = urlParams.get('iri')

        if(!projectUrl || !projectIri) return

        setProjectUrl(projectUrl)

        getProjectProps(projectUrl, projectIri)
    }

    async function getFunctionModuleList() {
        let user = (props.session.info.webId)? props.session.info.webId: "http://localhost:5000/Tester/profile/card#me"

        let userUrl = new URL(user)

        let baseUserUrl = userUrl.href.replace(userUrl.hash, "")

        console.log("trying to get modules from " + baseUserUrl)

        const queryBindings = await queryEngine.queryBindings(`
            PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?moduleManifest ?applicationName ?moduleName ?moduleExposeUrl
            WHERE {
                <${baseUserUrl}#savedModulesList> dct:hasPart ?moduleManifest.

                ?moduleManifest a mifestoRM:ModuleManifest;
                    mifestoRM:moduleName ?applicationName;
                    mifestoRM:hasFunctionModule ?functionModule.

                ?functionModule a mifestoRM:FunctionModule;
                    mifestoRM:hasVersion ?release.
                
                ?release a mifestoRM:Release;
                    mifestoRM:hasModule ?module.

                ?module a mifestoRM:Module;
                    rdfs:label ?moduleName;
                    mifestoRM:isExposedOn ?moduleExposeUrl.
            }
        `, {
            sources: [baseUserUrl]
        })

        let newModuleList:module[] = []

        queryBindings.on('data', (binding) => {
            console.log(binding.toString())

            const newModule:module = {
                name: binding.get('applicationName').value,
                exposeUrl: binding.get('moduleExposeUrl').value,
                moduleName: binding.get('moduleName').value,
                manifestUri: binding.get('moduleManifest').value
            }

            newModuleList.push(newModule)
        })

        queryBindings.on('end', () => {
            // console.log("query ended")
            if (newModuleList.length >= 1) {
                setModuleList(newModuleList)
            }
        })
    }

    async function getViewerModuleList() {
        let user = (props.session.info.webId)? props.session.info.webId: "http://localhost:5000/Tester/profile/card#me"

        let userUrl = new URL(user)

        let baseUserUrl = userUrl.href.replace(userUrl.hash, "")

        console.log("trying to get viewers from " + baseUserUrl)

        const queryBindings = await queryEngine.queryBindings(`
            PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?moduleManifest ?applicationName ?moduleName ?moduleExposeUrl

            WHERE {
                <${baseUserUrl}#savedModulesList> dct:hasPart ?moduleManifest.

                ?moduleManifest a mifestoRM:ModuleManifest;
                    mifestoRM:moduleName ?applicationName;
                    mifestoRM:hasViewerModule ?viewerModule.

                ?viewerModule a mifestoRM:ViewerModule;
                    mifestoRM:hasVersion ?release.
                
                ?release a mifestoRM:Release;
                    mifestoRM:hasModule ?module.

                ?module a mifestoRM:Module;
                    rdfs:label ?moduleName;
                    mifestoRM:isExposedOn ?moduleExposeUrl.
            }
        `, {
            sources: [baseUserUrl]
        })

        let newModuleList:module[] = []

        queryBindings.on('data', (binding) => {
            console.log(binding.toString())

            const newModule:module = {
                name: binding.get('applicationName').value,
                exposeUrl: binding.get('moduleExposeUrl').value,
                moduleName: binding.get('moduleName').value,
                manifestUri: binding.get('moduleManifest').value
            }

            newModuleList.push(newModule)
        })

        queryBindings.on('end', () => {
            console.log("query ended")
            console.log(newModuleList)
            if (newModuleList.length >= 1) {
                setViewerList(newModuleList)
            }
        })
    }

    async function getProjectProps(projectUrl:string, projectIri:string) {
        // console.log('beep!')
        if(!projectUrl || !projectIri) return

        // console.log(projectUrl + "#" + projectIri)

        const bindingStream = await queryEngine.queryBindings(`
            PREFIX solid: <http://www.w3.org/ns/solid/terms#>
            PREFIX vc: <http://www.w3.org/2006/vcard/ns#>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX consolid: <https://w3id.org/consolid#>

            SELECT ?projectName ?dataset ?item ?itemClass ?itemName
            
            WHERE {
                <${projectUrl + "#" + projectIri}> dct:title ?projectName;
                    dcat:dataset ?dataset.
                
                ?dataset dct:hasPart ?item.

                ?item a ?itemClass.

                OPTIONAL {
                    ?item rdfs:label ?itemName.
                }
                
            }

            
        `, {
            sources: [projectUrl]
        })

        let projectList:itemProps[] = []

        bindingStream.on('data', (binding) => {
            if(binding.get('projectName').value) {setPageHeader(binding.get('projectName').value)}
            // console.log(binding.toString())
            setProjectDataset(binding.get('dataset').value)

            const newItem:itemProps = {
                class: binding.get('itemClass').value,
                label: binding.get('itemName')?.value,
                uri: binding.get('item').value
            }

            projectList.push(newItem)

            // getItemProperties(newItem)
        })

        bindingStream.on('end', () => {
            
            // console.log(projectList)
            setProjectItemList(projectList)

            triggerGetItemProps(projectList, projectUrl)
        })
    }

    function triggerGetItemProps(projectList:itemProps[]|undefined, projectUrl:string|undefined) {
        if(!projectList || !projectUrl) return

        projectList.map((item:itemProps) => {
            getItemProperties(item, projectUrl)
        })

        return true
    }

    async function getItemProperties(item:itemProps, projectUrl:string) {
        if(!projectUrl) return

        // console.log('trying to get props from ' + item.label + ' at "' + item.uri + '"')

        const bindingStream = await secondQueryEngine.queryBindings(`
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>

            SELECT ?p ?o
            WHERE {
                <${item.uri}> ?p ?o.

                FILTER ( ?p != rdfs:label && ?p != rdf:type)
            }

            ORDER BY ?p
        `, {
            sources: [projectUrl]
        })

        let newPropArray:itemProps[] = []

        bindingStream.on('data', (binding) => {
            // console.log(binding.toString())

            newPropArray.push({
                class: binding.get('p').value,
                uri:  binding.get('o').value,
            })
        })

        bindingStream.on('end', () => {
            // console.log("got properties form " + item.label)
            // console.log(newPropArray)
            item.properties = newPropArray
        })

        bindingStream.on('error', (error) => {
            console.error(error)
            return
        })
    }

    function createItemGrid(itemList:itemProps[]|undefined) {

        if(!itemList) return <div>no items yet!</div>

        return <div className={selectedViewer? "hidden": "itemGrid"}>
            {itemList.map((item:itemProps) => {
                const itemUriAsUrl = new URL(item.uri)

                let itemHash = itemUriAsUrl.hash
                if(!itemUriAsUrl.hash) {
                    itemHash = itemUriAsUrl.pathname
                }

                return <ul key={item.uri} className={(selectedItem?.uri == item.uri)? "isSelected": ""} onClick={(event) => {toggleSelectedItem(event, item)}}>
                    <h1>{(item.label)? item.label: itemHash}</h1>
                    <label>Class:</label>
                    <p>{item.class}</p>
                    <label >URI:</label>
                    <p>{item.uri}</p>
                    <div className="propertyGrid">
                        {
                            createPropertyTable(item.properties)
                        }
                    </div>
                </ul>
            })}
        </div>
    }

    function createPropertyTable(propertyList:itemProps[]|undefined) {

        if(!propertyList) return undefined

        return propertyList.map((property:itemProps) => {
            let propertyAsUrl = new URL (property.class)

            let propertyDisplayString = propertyAsUrl.hash

            if(!propertyAsUrl.hash) {
                propertyDisplayString = propertyAsUrl.pathname
            }

            return <div key={property.uri}>
                <p>{propertyDisplayString}</p>
                <p>{property.uri}</p>
            </div>
        })

    }

    function toggleSelectedItem(event:React.MouseEvent, item:itemProps) {
        event.preventDefault()

        if(selectedItem === item) {
            setSelectedItem(undefined)
            console.log("removed selection")
            return
        }

        setSelectedItem(item)
        console.log("selected " + item.label)
    }

    function createModalTabs(list:module[]|undefined) {
        const emptyList:Array<module|undefined> = [undefined]

        let newList = emptyList

        if(list) {
            newList = emptyList.concat(list)
        }

        return newList.map((module:module|undefined) => {
            return <p className={(selectedModule == module)? "selected": ""} onClick={() => {setSelectedModule(module)}}>{(module)? module.name: "dashboard functions"}</p>
        })
    }

    function createWindowsTabs(list:module[]|undefined) {
        if(list) return list.map((module) => {
            return <p className={(selectedViewer == module)? "selected": ""} onClick={() => {setSelectedViewer(module)}} >{module.name}</p>
        })
    }

    async function getModuleParameters(module:module) {
        console.log(module.manifestUri)

        const bindingStream = await secondQueryEngine.queryBindings(`
        PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
        PREFIX dcat: <http://www.w3.org/ns/dcat>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX fno: <https://w3id.org/function/ontology#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        SELECT ?parameter ?parameterLabel ?requiredType
        WHERE {
            <${module.manifestUri}> a mifestoRM:ModuleManifest;
                mifestoRM:hasFunctionModule ?functionModule.

            ?functionModule mifestoRM:hasVersion ?release.

            ?release mifestoRM:consumesInput ?parameter.

            ?parameter a fno:Parameter;
                rdfs:label ?parameterLabel.

            OPTIONAL {
                ?parameter fno:type ?requiredType.
            }

        }
        `, {
            sources: [module.manifestUri]
        })

        bindingStream.on('data', (binding) => {
            console.log(binding.toString())

            let parameterUrl = new URL(binding.get('parameter').value)
            let parameterHashName = parameterUrl.hash
            console.log(parameterHashName)
        })
    }
    
    return(<div className="contentFrame">
        <ModuleStore isOpen={isStoreModalOpen} openModal={setIsStoreModalOpen} userUri={props.session.info.webId} session={props.session}/>
        <AddItemModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} dataset={projectDataset} database={projectUrl} projectName={props.pageHeader} />
        <RemoveItemModal isRemoveModalOpen={isRemoveModalOpen} setIsRemoveModalOpen={setIsRemoveModalOpen} item={selectedItem} dataset={projectDataset} database={projectUrl} />

        <div className="contentContainer">
            <div className="functionTabs">
                {createModalTabs(moduleList)}
                <button onClick={() => {setIsStoreModalOpen(true)}}>+</button>
            </div>
            <div className="externalFunctions">
                {/* <div>
                    <button onClick={() => {setIsStoreModalOpen(true)}}>test</button>
                    <button onClick={() => {getFunctionModuleList()}}>test moduleList</button>
                </div> */}
                {/* <BasicFunctionsProject dataset={projectDataset} item={selectedItem} session={props.session} projectName={props.pageHeader}/> */}
                <div className={(selectedModule == undefined)? "": "hidden"}>
                    <div>
                        <button 
                            onClick={() => {setIsAddModalOpen(!isAddModalOpen)}}
                            disabled={(projectDataset && projectUrl)? false: true}
                        >add concept item</button>

                        <button
                            onClick={() => {setIsRemoveModalOpen(true)}}
                            disabled={(selectedItem && projectDataset)? false: true}
                        >remove item</button>

                        <button>add data to another project</button>

                        <button onClick={() => {moduleList? getModuleParameters(moduleList[0]): console.log("error: no module found")}}>test</button>
                    </div>
                    
                </div>

                {buttonRows()}
            </div>
            <div className="viewerWindow">
                {createItemGrid(projectItemList)}
                {viewerWindows(viewerList)}
            </div>
            <div className="windowTabs">
                <p className={selectedViewer? "": "selected"} onClick={() => {setSelectedViewer(undefined)}} >dashboard list</p>
                {createWindowsTabs(viewerList)}
            </div>
            
        </div>
    </div> )
}