import * as Util from "./util.js";

export function getMarkerData(gradient) {
    const markers = gradient.querySelectorAll(".marker");
    const markerData = [];
    for(let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        const marker = markers[markerIndex];
        markerData.push({percent: parseFloat(marker.style.left), color: marker.style.backgroundColor});
    }
    markerData.sort((a, b) => {return a.percent - b.percent});
    return markerData;
}

export function sampleGradient(gradient, percent) {
    const markers = getMarkerData(gradient);
    let i = 0;
    while(i < markers.length) {
        if(markers[i].percent > percent) {
            break;
        }
        i++;
    }
    const c1 = Util.parseRgb(markers[i - 1].color);
    const c2 = Util.parseRgb(markers[i].color);
    const t2 = (percent - markers[i - 1].percent) / 100;
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t2),
        g: Math.round(c1.g + (c2.g - c1.g) * t2),
        b: Math.round(c1.b + (c2.b - c1.b) * t2),
    }
}