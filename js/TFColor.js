export class TFColor{
    constructor(wgapp) {
        this.webglapp = wgapp;
        this.start = 0.0;
        this.mid = 0.5
        this.end = 1.0;
        this.addCtrlPts();
        this.ctrlX = [0,150,300]
        this.select = 0
    }

    createColorCanvas(){
        const canvas = document.getElementById('TFCanvas');
        const ctx = canvas.getContext('2d');
    
        // Create a linear gradient (horizontal gradient in this case)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0); // From left to right
    
        // Define two colors for the gradient
        gradient.addColorStop(0, '#ad2b07');   // Start color (left side)
        gradient.addColorStop(0.5, '#FADFB4'); // End color (right side)
        gradient.addColorStop(1, '#faf2e3'); // End color (right side)
    
        // Set the fill style to the gradient
        ctx.fillStyle = gradient;
    
        // Fill the entire canvas with the gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    updateColorCanvas(start=this.start, mid= this.mid, end=this.end){

        const canvas = document.getElementById('TFCanvas');
        const ctx = canvas.getContext('2d');
        // Create a linear gradient (horizontal gradient in this case)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0); // From left to right
    
        // Define two colors for the gradient
        gradient.addColorStop(start, '#ad2b07');   // Start color (left side)
        gradient.addColorStop(mid, '#FADFB4'); // End color (right side)
        gradient.addColorStop(end, '#faf2e3'); // End color (right side)
    
        // Set the fill style to the gradient
        ctx.fillStyle = gradient;
    
        // Fill the entire canvas with the gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.start = start
        this.mid = mid
        this.end = end

        this.webglapp.volume.updateColormap()
        //console.log(this.webglapp.gl);
    
    }

    addCtrlPts(){
        console.log("adding ctrl pts")
        // Get the bounding box of the image
        const rect = document.getElementById("TFColor").getBoundingClientRect();
        // Calculate x and y relative to the image

        let h = rect.height, w =rect.width

        let x = 0.0, y = h;

        let triangle = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        triangle.setAttribute("id", "cc0");
        triangle.setAttribute("points", "-15,30,0,5,15,30");
        triangle.setAttribute("fill", "#ad2b07");
        triangle.addEventListener("mousedown", (event) => this.startDrag('cc0', event)); 
        triangle.addEventListener("mousemove", (event) => this.drag('cc0', event));
        triangle.addEventListener("mouseup", (event) => this.stopDrag('cc0',event));
        triangle.addEventListener("mouseleave", (event) => this.stopDrag('cc0',event));

        console.log(triangle)
        document.getElementById('svgOverlay2').appendChild(triangle);

        triangle = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        triangle.setAttribute("id", "cc1");
        triangle.setAttribute("points", "135,30,150,5,165,30");
        triangle.setAttribute("fill", "#FADFB4");
        triangle.addEventListener("mousedown", (event) => this.startDrag('cc1', event)); 
        triangle.addEventListener("mousemove", (event) => this.drag('cc1', event));
        triangle.addEventListener("mouseup", (event) => this.stopDrag('cc1',event));
        triangle.addEventListener("mouseleave", (event) => this.stopDrag('cc1',event));

        console.log(triangle)
        document.getElementById('svgOverlay2').appendChild(triangle);

        triangle = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        triangle.setAttribute("id", "cc2");
        triangle.setAttribute("points", "285,30,300,5,315,30");
        triangle.setAttribute("fill", "#faf2e3");
        triangle.addEventListener("mousedown", (event) => this.startDrag('cc2', event)); 
        triangle.addEventListener("mousemove", (event) => this.drag('cc2', event));
        triangle.addEventListener("mouseup", (event) => this.stopDrag('cc2',event));
        triangle.addEventListener("mouseleave", (event) => this.stopDrag('cc2',event));

        console.log(triangle)
        document.getElementById('svgOverlay2').appendChild(triangle);

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
        this.select = parseInt(id.slice(-1))
        this.dragging = true
        const triangle = document.getElementById(id)
        const svg = triangle.ownerSVGElement; // Get the SVG element
        this.offset = this.getMousePosition(svg, event);
        this.offset.x -= this.ctrlX[this.select];
        //console.log(this.offset)
    }

    drag(id, event){
        const triangle = document.getElementById(id)
        event.preventDefault();
        if (!this.dragging) return;
        console.log("dragging")
        const svg = triangle.ownerSVGElement; // Get the SVG element
        let coord = this.getMousePosition(svg,event);
        // Update the triangle's position
        let newx = coord.x - this.offset.x
        this.ctrlX[this.select] = newx
        triangle.setAttribute("cx", newx);
        let ptStr = "" + String(this.ctrlX[this.select] - 15) + ",30," + String(this.ctrlX[this.select]) + ",5," + String(this.ctrlX[this.select] + 15) + ",30"
        triangle.setAttribute("points", ptStr);
    }

    stopDrag(id,event){
        if (!this.dragging) return;
        this.dragging = false
        console.log("stopdrag")
        const triangle = document.getElementById(id)
        const svg = triangle.ownerSVGElement; // Get the SVG element
        let coord = this.getMousePosition(svg,event);
        // Update the triangle's position
        let newx = coord.x - this.offset.x
        this.ctrlX[this.select] = newx
        
        triangle.setAttribute("cx", newx);
        let ptStr = "" + String(this.ctrlX[this.select] - 15) + ",30," + String(this.ctrlX[this.select]) + ",5," + String(this.ctrlX[this.select] + 15) + ",30"
        triangle.setAttribute("points", ptStr);
        
        const rect = document.getElementById("TFCanvas").getBoundingClientRect();
        let value = newx/rect.width
        if(this.select == 0){
            this.updateColorCanvas(value, this.mid, this.end)
        }
        else if(this.select == 1){
            this.updateColorCanvas(this.start, value, this.end)
        }
        else{
            this.updateColorCanvas(this.start, this.mid, value)
        }

        //let opacity = 1.0 - newy/rect.height, value = newx/rect.width

        /*if(id === 'cp1'){
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
        }*/
    }

    

}



