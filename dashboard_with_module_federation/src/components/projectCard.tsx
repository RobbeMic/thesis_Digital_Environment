import React from 'react'
import { BiBuildingHouse } from 'react-icons/bi'

import "../styles/card.css"


function ProjectCard(projectName:string, projectUrl:string, rerouteFunction:Function, previewImage?:string) {

    if (!projectName || !projectUrl) {
        return
    }

    let image
    if (!previewImage){
        image = <div className='previewImage'>
            <BiBuildingHouse className='buildingIcon'/>
        </div>
        
    } else {
        image = <img src={previewImage} className='previewImage' />
    }

    return <button key={projectUrl} className='cardContainer' onClick={() => {rerouteFunction()}}>
        {image}
        <div className='projectTitle'>{projectName}</div>
        <div className='projectRef'>{projectUrl}</div>
    </button>
}

export default ProjectCard