import React, { useEffect, Suspense, useState, useRef, RefObject } from "react";

import * as THREE from 'three'
import { Canvas, useThree, useLoader } from "@react-three/fiber"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
// import { BlendFunction } from "postprocessing"


import { QueryEngine } from '@comunica/query-sparql-solid'

interface pageProps {
    readonly selectedItem: itemProps,
    readonly setSelectedItem: Function,
    readonly dataSet:string,
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

export default function ThreeScene(props:pageProps) {
    const queryEngine = new QueryEngine()

    const [modelList, setModelList] = useState<modelProps[]|null>(null)

    useEffect(() => {
        getModelLocation()
    }, [])

    async function getModelLocation() {
        const queryStream = await queryEngine.queryBindings(`
        PREFIX consolid: <https://w3id.org/consolid#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        PREFIX inst: <http://localhost:5000/Tester/ontology/inst#>

        SELECT ?item ?modelLocation

        WHERE {
            ?project a consolid:Project;
                dcat:dataset ?dataset.

            ?dataset a dcat:Dataset;
                dct:hasPart ?item.

            ?item inst:hasGltf ?modelLocation.
        }
        `, {
            sources: [props.dataSet]
        })

        let itemList:modelProps[] = []

        queryStream.on('data', (binding) => {
            console.log(binding.toString())

            let itemObject:itemProps = {
                class: "dummy",
                uri: binding.get('item').value,
            }

            let newItem:modelProps = {
                item: itemObject,
                gltf: binding.get('modelLocation').value
            }

            itemList.push(newItem)
        })

        queryStream.on('end', () => {
            console.log(itemList)
            if(itemList.length >= 1) {
                setModelList(itemList)
            }
        })
    }

    function CameraOrbitControls() {
        const {camera, gl} = useThree()

        useEffect(() => {
            const controls = new OrbitControls(camera, gl.domElement)
            
            return () => {
                controls.dispose()
            }
        }, [camera, gl])
        return null
    }

    function Plane() {
        return <mesh position={[0,0,0]} rotation={[-Math.PI/2,0,0]} receiveShadow={true} >
            <planeGeometry attach={"geometry"} args={[100, 100]} />
            <meshLambertMaterial attach="material" color="white" />
        </mesh>
    }

    function Box() {
        return <mesh position={[0,1,0]}>
            <boxGeometry attach="geometry" />
            <meshLambertMaterial attach="material" color="hotpink" />
        </mesh>
    }

    function loadModelList(list:modelProps[]|null) {
        // console.log(list)
        if(list && list.length > 0) {
            return list.map((item:modelProps) => {
                const modelLocation = item.gltf
                const { scene } = useLoader(GLTFLoader, modelLocation)
                return <primitive object={scene} />
            })
        }

        return null
    }

    const color = new THREE.Color(0xbcc5cf)
    const selectedColor = new THREE.Color(0xfc0362)

    function toggleSelectedItem(item:itemProps) {
        if(props.selectedItem?.uri == item.uri) {
            props.setSelectedItem(undefined)
            return
        }

        props.setSelectedItem(item)
    }

    function laodModelListAsJsx(list:modelProps[]|null) {
        if(!list || list.length == 0) return null

        return list.map((model) => {
            const modelLocation = model.gltf
            const gltf = useLoader(GLTFLoader, modelLocation)
            let mesh:THREE.Mesh|undefined

            gltf.scene.traverse((item):THREE.Mesh|undefined => {
                if(item.isMesh) {
                    // console.log("found a mesh")

                    mesh = item as THREE.Mesh
                }

                return undefined
            })

            if(mesh){
                return <mesh key={model.item.uri} geometry={mesh.geometry} scale={0.01} onClick={() => {toggleSelectedItem(model.item)}}>
                    <meshLambertMaterial color={(props.selectedItem?.uri == model.item.uri)? selectedColor: color} />
                </mesh>
            } else return null
        })
        

    }

    return <Canvas>
        <CameraOrbitControls/>
        <directionalLight color={"#f2ecce"} intensity={0.3} castShadow={false} position={[-1,1,-1]} />
        <ambientLight intensity={0.2} />
        <spotLight position={[-120,150,-100]} intensity={0.3} />
        <spotLight position={[120,150,100]} intensity={0.1} />

        <Plane/>

        {/* <EffectComposer>

        </EffectComposer> */}

        <Suspense fallback={<Box/>} >
            {laodModelListAsJsx(modelList)}
        </Suspense>
    </Canvas>
}