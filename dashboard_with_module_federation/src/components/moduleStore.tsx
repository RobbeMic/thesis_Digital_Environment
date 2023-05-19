import React, {useEffect, useState} from "react";
import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid";
import { Session } from "@inrupt/solid-client-authn-browser";
import { BiSearchAlt2 } from "react-icons/bi"
import { TbAppWindow } from "react-icons/tb"


import "../styles/modal.css"

interface pageProps {
    openModal:Function,
    isOpen:Boolean,
    session:Session,
    userUri?:string,
}

interface module {
    uri: string,
    name: string,
    description: string,
    imageSource?: string,
    isSaved?: boolean,
}

export default function ModuleStore(props:pageProps) {

    const queryEngine= new QueryEngine()

    const [moduleList, setModuleList] = useState<module[]|undefined>(undefined)
    const [selectedModule, setSelectedModule] = useState<module|undefined>(undefined)

    const lorem:string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam diam elit, rutrum id nibh vitae, pulvinar euismod orci. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Etiam in felis arcu. Duis volutpat ornare metus ac venenatis. Aliquam luctus, elit in auctor lacinia, nisl enim posuere ligula, vitae cursus magna diam elementum lorem. In hac habitasse platea dictumst. Sed rhoncus a quam at gravida. Suspendisse a rutrum turpis, eu ullamcorper eros. Morbi nec faucibus nibh, ac molestie metus. Aenean imperdiet congue dui id tincidunt. Nunc eget dolor ac diam tincidunt lacinia vel at sapien. Duis pharetra vitae dui eget malesuada. In efficitur justo vitae mi aliquet, quis pulvinar felis blandit. Donec dapibus volutpat dapibus. Duis sed libero id nunc tincidunt euismod vitae nec odio. Proin et molestie tortor, eget pretium massa."

    useEffect(() => {
        getModuleList()
    }, [])

    function createModuleTable(list:module[]|undefined) {
        if(!list || list.length < 1) {return <div className="">
            placeHolder
        </div>}

        return list.map((module) => {

            return <ul onClick={() => {toggleSelectedModule(module)}} className={(selectedModule === module)? "isSelected": ""} key={module.uri}>
                    <div>
                        {(module.imageSource)? <img src={module.imageSource} alt={"logo " + module.name}/>: <TbAppWindow/>}
                    </div>
                    
                    <div>
                        <h1>{module.name}</h1>
                        <p className="uriDescriptor">{module.uri}</p>
                        <div className="storeButtonContainer">
                            <button>Manifest</button>
                            {
                                (module.isSaved)? 
                                <button onClick={() => {removeModuleFromProfile(module)}} className="removeButton" >Remove</button>:
                                <button onClick={() => {saveModuleToProfile(module)}} className="addButton">Federate</button>
                            }
                            
                        </div>
                        <p className={(selectedModule === module)? "description shownDescription": "description hiddenDescription"}>{module.description}</p>
                    </div>
                    
                </ul>
        })
    }

    async function getModuleList() {

        const queryBindings = await queryEngine.queryBindings(`
            PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
            PREFIX dcat: <http://www.w3.org/ns/dcat>
            PREFIX dct: <http://purl.org/dc/terms/>

            SELECT DISTINCT ?moduleUri ?moduleName ?moduleDesc
            WHERE {
                <http://localhost:5000/Tester/store/simpleDummyStore#_store> a mifestoRM:Store;
                    dcat:dataset ?dataset.
                
                ?dataset a dcat:Catalog;
                    dcat:hasPart ?moduleUri.

                ?moduleUri a mifestoRM:ModuleManifest;
                    mifestoRM:moduleName ?moduleName;
                    mifestoRM:moduleDescription ?moduleDesc.

                
            }            
        `, {
            sources: ["http://localhost:5000/Tester/store/simpleDummyStore"]
        })

        const foundModuleList:module[] = []

        queryBindings.on('data', (binding) => {
            console.log(binding.toString())
            const newModule:module = {
                uri: binding.get('moduleUri').value,
                name: binding.get('moduleName').value,
                description: binding.get('moduleDesc').value
            }

            foundModuleList.push(newModule)
        })

        queryBindings.on('end', () => {
            console.log("got all the associated applications")
            if(foundModuleList.length >= 1) {
                foundModuleList.map((module) => {
                    testIsModuleSaved(module)
                })
                setModuleList(foundModuleList)
            }
        })
    }

    async function saveModuleToProfile(module:module) {
        let user = (props.userUri)? props.userUri: "http://localhost:5000/Tester/profile/card#me"

        let userUrl = new URL(user)

        let baseUserUrl = userUrl.href.replace(userUrl.hash, "")

        await queryEngine.queryVoid(`
            PREFIX mifestoRM: <http://localhost:5000/Tester/ontology/mifestoRM#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>

            INSERT DATA {
                <${baseUserUrl}#savedModulesList> a dcat:Catalog;
                    dct:hasPart <${module.uri}>.
            }
        `, {
            sources: [user],
            '@comunica/actor-http-inrupt-solid-client-authn:session': props.session
        })

        
    }


    async function testIsModuleSaved(module:module) {

        let user = (props.userUri)? props.userUri: "http://localhost:5000/Tester/profile/card#me"

        let userUrl = new URL(user)

        let baseUserUrl = userUrl.href.replace(userUrl.hash, "")

        const isSaved = await queryEngine.queryBoolean(`
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>

            ASK {
                <${baseUserUrl}#savedModulesList> dct:hasPart <${module.uri}>
            }
        `,{
            sources: [baseUserUrl]
        })

        module.isSaved = isSaved
    }

    async function removeModuleFromProfile(module:module) {
        if(!props.session.info.isLoggedIn || !props.userUri) {
            console.log("you should be logged in to alter modules")
            return
        }

        console.log("removing " + module.uri)

        const userUrl = new URL(props.userUri)

        let baseUserUrl = userUrl.href.replace(userUrl.hash, "")

        console.log("from " + baseUserUrl)

        await queryEngine.queryVoid(`
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>
            
            DELETE {
                ?catalog dct:hasPart <${module.uri}>.
            }

            WHERE {
                ?catalog dct:hasPart <${module.uri}>.
            }
        
        `, {
            sources: [baseUserUrl],
            '@comunica/actor-http-inrupt-solid-client-authn:session': props.session
        })
    }

    function toggleSelectedModule(module:module) {
        if(selectedModule === module) {
            setSelectedModule(undefined)
            console.log("set the selected module to undefined")
            return
        }


        setSelectedModule(module)
        console.log("set the selected module to " + module.name)
    }

    return <div className={props.isOpen? "positionAbsolute modalBackground": "positionAbsolute hidden"}>
        <div className="modal">
            <span onClick={() => {props.openModal(false)}}>x</span>
            <h1>Micro Front-End Store</h1>
            <div className="searchbar">
                <BiSearchAlt2 />
                <input type="text" placeholder={`Search modules`} />
            </div>
            
            <div className="moduleContainer">
                {createModuleTable(moduleList)}
            </div>
        </div>
    </div>
}