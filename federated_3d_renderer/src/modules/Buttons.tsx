import React from "react";

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

    return <div>
        <button onClick={() => {console.log(props.variableProps.item)}} >Add geometry</button>
        <button>Remove geometry</button>
    </div>
}