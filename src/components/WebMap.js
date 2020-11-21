import React, { useEffect, useRef } from "react";
import {Spinner} from './spinner';

//Calling a JS file which contains the Cesium viewer
export function WebMap() {
  const elementRef = useRef();

  useEffect(_ => {
    let cleanup;
   
    import("./cesiumApp").then(
      app => cleanup = app.initialize(elementRef.current)
    );
    return () => cleanup && cleanup();
  }, []);

  // assign elementRef to the ref of our component
  return (
    <div className="viewDiv" ref={elementRef}>
      <Spinner></Spinner>
    </div>
  )
}
 
