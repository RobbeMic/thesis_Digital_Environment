import React from "react";

import ThreeScene from "../components/ThreeScene";

import '../3d_rederer_styles.css'

interface pageProps {
    readonly selectedItem: itemProps,
    readonly setSelectedItem: Function,
    readonly dataSet:string,
}

interface passedProps {
    [key: string]: any,
}

interface itemProps {
    class: string,
    uri: string,
    label?: string,
    properties?: itemProps[],
}

export default function ThreeContainer(props:passedProps) {
    return <div className="three_d_renderer_container">
        <ThreeScene selectedItem={props.variableProps.item} setSelectedItem={props.variableProps.setItem} dataSet={props.variableProps.database} />
    </div>
}