import React, { useEffect, useState } from "react";

//Fading out method for the spinner background
function fadeOutEffect() {
    let done="no";
    return new Promise(function(resolve, reject) {
    var fadeTarget = document.getElementById("spinnerBG");
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
                resolve("done")
            
        }
    }, 200);
        if (done=="yes"){
                reject("error")
        }  
    });
}

//Define the execution of the spinner which runs until a ceratin file has been loaded
export function Spinner(){
    const [visible, setVisiblity] = useState('block');    
    var oldXHR = window.XMLHttpRequest;
    function newXHR() {
        var realXHR = new oldXHR();
        realXHR.addEventListener("readystatechange", function() {
            if(realXHR.readyState==4 && realXHR.status==200){
                
               if (realXHR.responseURL=="https://ecn.t2.tiles.virtualearth.net/tiles/a12033.jpeg?n=z&g=9458"){     
                    fadeOutEffect().then(
                     setVisiblity("none"));
               }
            }
        }, false);
        return realXHR;
    }
    
    window.XMLHttpRequest = newXHR;
    return(
        <div id="spinnerBG"  style={{position: 'absolute',display:`${visible}`,width:'100%',height:'100%',top:"0%",left:"0%",zIndex:'9999','background':'rgba(0, 0, 0, 0.8)'}}>
            <img id="chicago" src="https://i.imgur.com/U065sJK.gif"></img>
        </div>
    )
}
