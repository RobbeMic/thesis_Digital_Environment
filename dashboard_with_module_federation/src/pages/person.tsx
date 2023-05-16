import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { Session } from "@inrupt/solid-client-authn-browser"
import { QueryEngine } from "@comunica/query-sparql-link-traversal-solid"
import { BiPlus, BiBookmarkMinus } from "react-icons/bi"

import "../styles/content.css"

import ProjectCard from "../components/projectCard";
import CreateProjectModal from "../components/createProjectModal";

interface pageProps {
    readonly pageHeader: string,
    setPageHeader: Function,
    session:Session,
}

interface ProjectProps {
    name: string,
    url: string,
    iri: string,
    creator?: string,
    description?: string
}

export default function Person(props:pageProps) {
    const queryEngine = new QueryEngine()
    const navigate = useNavigate()

    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false)

    const [projectDataList, setProjectDataList] = useState<ProjectProps[]>([])
    // let projectDataList:ProjectProps[] = []

    // const cardList = useMemo(() => createProjectCard(projectDataList), [projectDataList])
    const [cardList, setCardList] = useState<(JSX.Element|undefined)[]|undefined>([
        <div className="skeletonCardContainer">
            <div className='previewImage'></div>
            <div className='projectTitle skeletonText'></div>
            <div className='projectRef skeletonText'></div>
        </div>,
        <div className="skeletonCardContainer">
            <div className='previewImage'></div>
            <div className='projectTitle skeletonText'></div>
            <div className='projectRef skeletonText'></div>
        </div>,
        <div className="skeletonCardContainer">
            <div className='previewImage'></div>
            <div className='projectTitle skeletonText'></div>
            <div className='projectRef skeletonText'></div>
        </div>,
    ])

    // const cardList = createProjectCard(projectDataList)

    const setPageHeader = props.setPageHeader
    let pageName = "page"
    if(props.pageHeader) {
        pageName = props.pageHeader
    }

    useEffect(() => {
        setPageHeader(pageName)
        handleRedirectAfterLogin()
    }, [])

    async function handleRedirectAfterLogin() {
        await props.session.handleIncomingRedirect()

        if (!props.session.info.isLoggedIn) return

        console.log("Handling redirect!")
        console.log(props.session.info)

        const newWebId = props.session.info.webId

        if(!newWebId) return

        // not efficient as the personal information is given again with each project, should be in two bindings
        const bindingStream = await queryEngine.queryBindings(`
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            PREFIX solid: <http://www.w3.org/ns/solid/terms#>
            PREFIX vc: <http://www.w3.org/2006/vcard/ns#>
            PREFIX dcat: <http://www.w3.org/ns/dcat#>
            PREFIX dct: <http://purl.org/dc/terms/>

            SELECT ?person ?name ?projectCatalog ?project ?projectName
            WHERE {
            ?person a foaf:Person;
                vc:fn ?name.
            ?projectCatalog a dcat:Catalog;
                dct:hasPart ?project.
            ?project dct:title ?projectName.
            }`, {
            sources: [newWebId]
        })

        bindingStream.on('data', (binding) => {
            console.log(binding.toString())
            let name:string = binding.get('name').value
            if(name) {setPageHeader(name)}

            if(binding.get('project').value){
                const projectIri = new URL(binding.get('project').value)

                console.log(projectIri.host + projectIri.pathname)
                console.log(projectIri.hash.slice(1))
                const newProject:ProjectProps = {
                    name: binding.get('projectName').value,
                    url: projectIri.origin + projectIri.pathname,
                    iri: projectIri.hash.slice(1)
                }

                // let dummyList = projectDataList
                // dummyList.push(newProject)

                // console.log(dummyList)
                // setProjectDataList(dummyList)
                projectDataList.push(newProject)
            }

        })

        bindingStream.on('end', () => {
            setCardList(createProjectCard(projectDataList))
        })
    }

    function createProjectCard(list:ProjectProps[]) {
        if(list.length < 1) {console.log('list is empty'); return}

        console.log('creating project cards!')

        return list.map((item:ProjectProps) => {
            function reroute() {
                setPageHeader(item.name)
                navigate(`/project?url=${item.url}&iri=${item.iri}`)
            }

            return ProjectCard(item.name, item.url, reroute)
        })
    }

    return (<div className="contentFrame">
        <CreateProjectModal session={props.session} isModalOpen={isCreateProjectModalOpen} setIsModalOpen={setIsCreateProjectModalOpen} setPageHeader={setPageHeader} />
        <div className="baseFunctions" >
            <button onClick={() => setIsCreateProjectModalOpen(true)}><BiPlus/> Create new project</button>
            <button><BiBookmarkMinus/> Remove project from my profile</button>
        </div>

        <div className="contentContainer flex-direction-row">
            {cardList}
        </div>
    </div> )
}