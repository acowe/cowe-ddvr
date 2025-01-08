import { WebGLApp } from './webglApp.js';

export class TF{
    constructor(wgapp) {
        this.webglapp = wgapp;
        this.ctrlPts = [{x:0.0, y:0.0},{x:1.0, y:1.0}]
        this.webglapp.setOpacity(this.ctrlPts[0].x, this.ctrlPts[1].x, this.ctrlPts[0].y, this.ctrlPts[1].y)
        this.dragging = false
        this.addCtrlPts();
        this.offset = { x: 0, y: 0 };
        this.select = 'cp1'

    }

    addCtrlPts(){
        console.log("adding ctrl pts")
        // Get the bounding box of the image
        const rect = document.getElementById("TFCanvas").getBoundingClientRect();
        console.log(rect)
        // Calculate x and y relative to the image

        let h = rect.height, w =rect.width

        let x = 0.0, y = h;

        let line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', 0.0);
        line.setAttribute('y1', h);
        line.setAttribute('x2', w);
        line.setAttribute('y2', 0.0);
        line.setAttribute('stroke-width', 2); // Circle radius
        line.setAttribute('stroke', 'black'); // Circle color
        line.setAttribute('id', 'line'); // Circle color

        document.getElementById('svgOverlay').appendChild(line);

        let circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 10); // Circle radius
        circle.setAttribute('fill', 'white'); // Circle color
        circle.setAttribute('id', 'cp1'); // Circle color
        circle.addEventListener("mousedown", (event) => this.startDrag('cp1', event)); 
        circle.addEventListener("mousemove", (event) => this.drag('cp1', event));
        //circle.addEventListener("mouseup", (event) => this.stopDrag('cp1',event));
        //circle.addEventListener("mouseleave", (event) => this.stopDrag('cp1',event));
        
        // Circle color //this.startDrag('cp1', event)
        console.log(circle)

        document.getElementById('svgOverlay').appendChild(circle);


        x = w, y = 0.0;

        circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 10); // Circle radius
        circle.setAttribute('fill', 'white'); // Circle color
        circle.setAttribute('id', 'cp2'); // Circle color
        circle.addEventListener("mousedown", (event) => this.startDrag('cp2', event)); 
        circle.addEventListener("mousemove", (event) => this.drag('cp2', event));

        // Append the circle to the SVG overlay
        document.getElementById('svgOverlay').appendChild(circle);

    }

    addCtrlPt(event){
        console.log("adding ctrl pt")
        // Get the bounding box of the image
        const rect = document.getElementById("TFCanvas").getBoundingClientRect();
        // Calculate x and y relative to the image
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        let opacity = 1.0 - y/rect.height, value = x/rect.width
        console.log(value)
        this.ctrlPts[0].x = value
        this.ctrlPts[0].y = opacity



        this.webglapp.setOpacity(value, this.ctrlPts[1].x, opacity, this.ctrlPts[1].y)

        if (document.getElementById('ctrl_pt')){
            document.getElementById('ctrl_pt').remove();
        }

        const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 10); // Circle radius
        circle.setAttribute('fill', 'white'); // Circle color
        circle.setAttribute('id', 'ctrl_pt'); // Circle color

        // Append the circle to the SVG overlay
        document.getElementById('svgOverlay').appendChild(circle);
    }

    getMousePosition(svg, evt) {
        var CTM = svg.getScreenCTM();
        return {
          x: (evt.clientX - CTM.e) / CTM.a,
          y: (evt.clientY - CTM.f) / CTM.d
        };
    }
    
    startDrag(id, event){
        console.log("startdrag")
        this.select = id
        this.dragging = true
        const circle = document.getElementById(id)
        const svg = circle.ownerSVGElement; // Get the SVG element
        this.offset = this.getMousePosition(svg, event);
        this.offset.x -= parseFloat(circle.getAttribute("cx"));
        this.offset.y -= parseFloat(circle.getAttribute("cy"));
        //console.log(this.offset)
    }

    drag(id, event){
        const circle = document.getElementById(id)
        const line = document.getElementById("line")
        event.preventDefault();
        if (!this.dragging) return;
        console.log("dragging")
        const svg = circle.ownerSVGElement; // Get the SVG element
        let coord = this.getMousePosition(svg,event);
        // Update the circle's position
        let newx = coord.x - this.offset.x, newy = coord.y - this.offset.y
        circle.setAttribute("cx", newx);
        circle.setAttribute("cy", newy);
        

        if(id === 'cp1'){
            line.setAttribute('x1', newx);
            line.setAttribute('y1', newy);
        }

        else if (id == 'cp2'){
            line.setAttribute('x2', newx);
            line.setAttribute('y2', newy);
        }
        //circle.setAttribute("cy", 100);

    }

    stopDrag(id,event){
        if (!this.dragging) return;
        console.log("stopdrag")
        this.dragging = false
        const circle = document.getElementById(id)
        const line = document.getElementById("line")
        const svg = circle.ownerSVGElement; // Get the SVG element
        let coord = this.getMousePosition(svg,event);
        let newx = coord.x - this.offset.x, newy = coord.y - this.offset.y
        circle.setAttribute("cx", newx)
        circle.setAttribute("cy", newy);

        const rect = document.getElementById("TFCanvas").getBoundingClientRect();
        let opacity = 1.0 - newy/rect.height, value = newx/rect.width

        if(id === 'cp1'){
            line.setAttribute('x1', newx);
            line.setAttribute('y1', newy);
            this.ctrlPts[0].x = value
            this.ctrlPts[0].y = opacity
            this.webglapp.setOpacity(value, this.ctrlPts[1].x, opacity, this.ctrlPts[1].y)
        }

        else if (id == 'cp2'){
            line.setAttribute('x2', newx);
            line.setAttribute('y2', newy);
            this.ctrlPts[1].x = value
            this.ctrlPts[1].y = opacity
            this.webglapp.setOpacity(this.ctrlPts[0].x, value, this.ctrlPts[0].y, opacity)
        }

        
        

        //this.offset = { x: 0, y: 0 };
    }



}