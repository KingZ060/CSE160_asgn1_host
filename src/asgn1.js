// CSE160 Assignment 1
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if(!u_Size){
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

function renderAllShapes(){
    var startTime = performance.now();

    // Clear <canvas>   
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var len = g_points.length;
    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    sendTexttoHTML("numdot: " + len + " ms: " + Math.floor(duration) + " FPS: " + Math.floor(10000 / duration), "numdot");
}

var g_shapesList = [];
// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];  // The array to store the size of a point

function click(ev) {
    let [x,y] = convertCoordinatesEventToGL(ev);

    let point;
    if(g_selectedType == POINT){
        point = new Point();
    }else if(g_selectedType == TRIANGLE){
        point = new Triangle();
    }else{
        point = new Circle();
        point.segments = g_selectedSegment;
    }

    // let point = new Point();
    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    // Store the coordinates to g_points array
    // g_points.push([x, y]);
    // g_colors.push(g_selectedColor.slice());
    // g_sizes.push(g_selectedSize);

    // Store the coordinates to g_points array
    // if (x >= 0.0 && y >= 0.0) {      // First quadrant
    // g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    // } else if (x < 0.0 && y < 0.0) { // Third quadrant
    // g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    // } else {                         // Others
    // g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    // }

    renderAllShapes();
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegment=20;

function addActionsForHtmlUI(){
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0];};
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0];};
    document.getElementById('blue').onclick = function() { g_selectedColor = [0.0, 0.0, 1.0, 1.0];};
    document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes();};

    document.getElementById('pointButton').onclick = function () { g_selectedType = POINT };
    document.getElementById('triButton').onclick = function () { g_selectedType = TRIANGLE };
    document.getElementById('circleButton').onclick = function () { g_selectedType = CIRCLE };

    document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

    document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; });
    document.getElementById('segmentSlide').addEventListener('mouseup', function () { g_selectedSegment = this.value; });


    document.getElementById('drawFunction').onclick = function() { drawImage(); };
}

function sendTexttoHTML(text, htmlID) {
    var htmlElem = document.getElementById(htmlID);
    if (!htmlElem) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElem.innerHTML = text;
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();


    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev); } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function drawImage(){
    g_shapesList = [];
    renderAllShapes();
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    //Fox Part
    var p1 = new CustomTriangle();
    p1.color = [0.0, 0.0, 1.0, 1];
    p1.vertices = [-0.5, 0.5, 0.5, 0.5, 0, 0];
    g_shapesList.push(p1);

    var p2 = new CustomTriangle();
    p2.color = [0.0, 0.0, 1.0, 1];
    p2.vertices = [0.2, 0.5, 0.5, 0.5, 0.35, 0.75];
    g_shapesList.push(p2);

    var p3 = new CustomTriangle();
    p3.color = [0.0, 0.0, 0.0, 1];
    p3.vertices = [0.275, 0.5, 0.425, 0.5, 0.35, 0.65];
    g_shapesList.push(p3);

    var p4 = new CustomTriangle();
    p4.color = [0.0, 0.0, 1.0, 1];
    p4.vertices = [-0.2, 0.5, -0.5, 0.5, -0.35, 0.75];
    g_shapesList.push(p4);

    var p5 = new CustomTriangle();
    p5.color = [0.0, 0.0, 0.0, 1];
    p5.vertices = [-0.275, 0.5, -0.425, 0.5, -0.35, 0.65];
    g_shapesList.push(p5);

    var p6 = new CustomTriangle();
    p6.color = [1.0, 1.0, 1.0, 1];
    p6.vertices = [0.05, 0.25, 0.25, 0.45, 0.3, 0.4];
    g_shapesList.push(p6);

    var p7 = new CustomTriangle();
    p7.color = [1.0, 1.0, 1.0, 1];
    p7.vertices = [-0.05, 0.25, -0.25, 0.45, -0.3, 0.4];
    g_shapesList.push(p7);

    var numPoints = 31;
    for (var i = 0; i < numPoints; i++) {
        var x = i*0.01;
        var line1 = new Point();
        line1.position = [x, 0.15];
        line1.size = 5;
        line1.color = [0.0, 0.0, 1.0, 1.0];
        g_shapesList.push(line1);

        var line2 = new Point();
        line2.position = [-x, 0.15];
        line2.size = 5;
        line2.color = [0.0, 0.0, 1.0, 1.0];
        g_shapesList.push(line2);
    }

    for (var z = 0; z < numPoints; z++) {
        var x = z*0.01;
        var y = 0.1-0.005*z;
        var line1 = new Point();
        line1.position = [x, y];
        line1.size = 5;
        line1.color = [0.0, 0.0, 1.0, 1.0];
        g_shapesList.push(line1);

        var line2 = new Point();
        line2.position = [-x, y];
        line2.size = 5;
        line2.color = [0.0, 0.0, 1.0, 1.0];
        g_shapesList.push(line2);
    }

    var p8 = new CustomTriangle();
    p8.color = [0.0, 0.0, 1.0, 1];
    p8.vertices = [0.15, 0.3, 0.15, -0.75, 0.8, -0.75];
    g_shapesList.push(p8);

    var p9 = new CustomTriangle();
    p9.color = [0.0, 0.0, 1.0, 1];
    p9.vertices = [0.8, -0.75, 0.6, 0, 1, 0];
    g_shapesList.push(p9);

    var p10 = new CustomTriangle();
    p10.color = [0.0, 0.0, 1.0, 1];
    p10.vertices = [0.6, 0.005, 0.8, 0.255, 1, 0.005];
    g_shapesList.push(p10);

    var p11 = new CustomTriangle();
    p11.color = [1.0, 1.0, 1.0, 1];
    p11.vertices = [0.15, -0.75, 0.225, -0.6, 0.3, -0.75];
    g_shapesList.push(p11);

    var p12 = new CustomTriangle();
    p11.color = [1.0, 1.0, 1.0, 1];
    p12.vertices = [0.3, -0.75, 0.375, -0.6, 0.45, -0.75];
    g_shapesList.push(p12);


    //Tree Part
    drawTreeOntoImage([-1.25, -0.4, -0.25, -0.4, -0.75, 0.1]);
    drawTreeOntoImage([0.3, 0.85, 1.3, 0.85, 0.8, 1.35]);
    renderAllShapes();
}

function drawTreeOntoImage(vertices){
    var p1 = new CustomTriangle();
    p1.color = [0.0, 0.0, 1.0, 1];
    p1.vertices = [vertices[0], vertices[1], vertices[2], vertices[3], vertices[4], vertices[5]];
    g_shapesList.push(p1);

    var p2 = new CustomTriangle();
    p2.color = [0.0, 0.0, 1.0, 1];
    p2.vertices = [vertices[0]+0.1, vertices[1]+0.3, vertices[2]-0.1, vertices[3]+0.3, vertices[4], vertices[5]+0.3];
    g_shapesList.push(p2);

    var p3 = new CustomTriangle();
    p3.color = [0.0, 0.0, 1.0, 1];
    p3.vertices = [vertices[0]+0.2, vertices[1]+0.6, vertices[2]-0.2, vertices[3]+0.6, vertices[4], vertices[5]+0.6];
    g_shapesList.push(p3);

    var p4 = new CustomTriangle();
    p4.color = [0.0, 0.0, 1.0, 1];
    p4.vertices = [vertices[0]+0.3, vertices[1]-0.35, vertices[2]-0.3, vertices[3]-0.35, vertices[4], vertices[5]-0.35];
    g_shapesList.push(p4);
}