import React, { useState } from "react";

import ThreeContainer from "../modules/ThreeContainer";

import Buttons from "../modules/Buttons";

interface itemProps {
    class: string,
    uri: string,
    label?: string,
    properties?: itemProps[],
  }

export default function LandingPage() {
    const [selectedItem, setSelectedItem] = useState<itemProps|undefined>(undefined)

    const variableProps = {
    item: selectedItem,
    setItem: setSelectedItem,
    database: "http://localhost:5100/Tester/projects/test"
    }

    return <div className="container">
    <div>Name: federated_3d_renderer</div>
    <div>Framework: react</div>
    <div>Language: TypeScript</div>
    <div>CSS: Empty CSS</div>
    <div>
      <ThreeContainer variableProps={variableProps} />
    </div>
    <Buttons variableProps={variableProps} />
  </div>
}