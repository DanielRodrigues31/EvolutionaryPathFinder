class Path{
  /* Intialises default values for each path
   * @constructor 
   */
  constructor() {
    this.radius = 30;
    this.nodes = []
  }
  
  /* Intialises new node to path using cartesian coordinate
   * @param {int} x
     @param {int} y */
  set_point(x,y){
    let node = createVector(x,y);
    this.nodes.push(node);
  }

  /* Draws a vector line end to end between each node with a surrounding path line, with a thickness of the
     radius */ 
  output() {
    noFill();
    strokeJoin(ROUND);
    stroke(200);
    strokeWeight(1);
    beginShape();
    for(let element of this.nodes) {
      vertex(element.x, element.y)
    }
    endShape(CLOSE)
    noFill();
    strokeJoin(ROUND);
    stroke(255, 100);
    strokeWeight(this.radius*2);
    beginShape();
    for(let element of this.nodes){
      vertex(element.x, element.y)
    }
    endShape(CLOSE);
    //line(this.start.x, this.start.y, this.end.x, this.end.y);
  }
  
}