class Vehicle {
  /* Initial properties when constructing a new vehicle
   * @constructor
   * @param {int} id - passes the vehicle id, used as a reference
   * @param {int} dna - existing configurations for the DNA structure
  */
  constructor(id, dna) {
    this.id = id; // vehicle id
    this.position = createVector(60, height/2); // initial position
    this.velocity = createVector(10, 0); // initial velocity
    this.acceleration = createVector(0, 0); // initial acceleration
    this.r = 15; // size of vehicle shape
    this.score = 0; // vehicle's score
    this.frames = 0; // timer
    this.finished = false; 
    this.trail = []; // stores vehicles path
    
    this.dna = dna; // maxSpeed, maxAngle, vision
    this.maxSpeed = this.dna[0]
    this.maxAngle = this.dna[1]
    this.vision = this.dna[2]
  }
  
  /* Called by main and used as central function to manage other functions
   * @param {vector} path - series of vertexs
  */
  main(path){
    this.update();
    this.output();
    this.follow(path);
    this.set_points(path);
  }
  /* Called if vehicle is either out of bounds or finished the race
   * @return {array} statistics
  */
  finish(){
    this.maxSpeed = 0;
    this.finished = true;
    return [this.score, this.frames];
  }
  /* Calculates and sets steering angle depending on relative target
   * @param {vector} target - x y location of target position */  
  track(target) {
    let desired_velocity = p5.Vector.sub(target, this.position);
    desired_velocity.setMag(this.maxSpeed);
    let steering = p5.Vector.sub(desired_velocity, this.velocity);
    steering.limit(this.maxAngle); // caps magnitude
    this.set_steer_angle(steering);
  }
  
  set_points(path){
    let p_end = path.nodes[(this.score+1) % path.nodes.length];
    let dist = p5.Vector.dist(this.position, p_end);
    //console.log(dist)
    if (dist <= path.radius*4){
      this.score += 1;
      //console.log(this.score);
    }
    
    if (this.score >= 12 && this.finished == false){
      this.finish();
    }
  }
  
  /* Calculates future position based on vision range*/
  future_position(){
    let vel_copy = this.velocity.copy(); // creates instance of velocity
    vel_copy.mult(this.vision); // multiplies copy by vision
    let future = vel_copy.add(this.position); // adds new velocity to current position
    fill(255, 0, 0);
    noStroke();
    circle(future.x, future.y, 16); // visually represents future position
    return future; // returns future position
  }
  
  /* iterates through all the paths and finds the shortest length to a valid projected point
   * @param {vector} path - series of vertexs
  */
  follow(path){
    
    let future_maximum = Infinity; // intialising future highest distance
    let current_maximum = Infinity; // intialising current highest distance
    let normal = null;
    let target = null;
    
    for (let i = 0; i < path.nodes.length; i++) { // iterating through all path nodes
      let start = path.nodes[i]; // declaring start node
      let end = path.nodes[(i+1) % path.nodes.length]; // declaring end node
      
      // vector projection of future location on path
      let future_projection = this.vectorProjection(start, this.future_position(), end);
      // vector projection of future location on path
      let current_projection = this.vectorProjection(start, this.position, end);
      // declaring direction of path
      let direction = p5.Vector.sub(end,start);
      // checking if projection is off the path
      if (future_projection.x < min(start.x, end.x) || future_projection.x > max(start.x, end.x) || 
          future_projection.y < min(start.y, end.y) || future_projection.y > max(start.y, end.y)  )
      {
        // set future projection to the end of the path
        future_projection = end.copy();
        // look forward onto the new path
        start = path.nodes[(i + 1) % path.nodes.length];
        end = path.nodes[(i + 2) % path.nodes.length];
        direction = p5.Vector.sub(end, start);
      }
      // intialise the distance from future position to future projection
      let future_distance = p5.Vector.dist(this.future_position(), future_projection);
      // intialise the distance from position to projection
      let current_distance = p5.Vector.dist(this.position, current_projection);
      
      // if the future distance is smaller than the future max record, set said distance to record
      if(future_distance < future_maximum){
        future_maximum = future_distance;
        direction.normalize().mult(60); // target future location
        target = future_projection.copy(); // set target
        target.add(direction); // add the direction
      }
      
      // if the distance is smaller than the max record, set said distance to record
      if(current_distance < current_maximum){
        current_maximum = current_distance;
      }
    }
    // visually represent projected target
    fill(0, 255, 0);
    noStroke();
    circle(target.x, target.y, 16);
    
    // Out of bounds  
    if (current_maximum > 30 && this.finished == false ){
        this.finish();
    }
    
    // Rectify direction
    if (future_maximum > path.radius) {
      //console.log(future_maximum)
      return this.track(target);
    } else {
      return createVector(0, 0);
      //return this.track(target);
    }
  }
  // get vector projection of vehicle future location onto path
  vectorProjection(start, future, finish){
    let future_start = p5.Vector.sub(future, start);
    let path = p5.Vector.sub(finish, start).normalize();
    let scalar_projection = future_start.dot(path);
    return path.mult(scalar_projection).add(start);
  }
  // set steering angle
  set_steer_angle(angle) {
    this.acceleration.add(angle);
  }
  
  // each frame, update locomotion
  update() {
    if (this.finished == false){
      this.frames += 1;
      append(this.trail, this.position.copy());
    }
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0);
  }
  /* vehicle display representation */
  output() {
    stroke(0);
    strokeWeight(1);
    fill(255);
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();
  }
  /* vehicle cant go outside the margins of the canvas */
  edges() {
    if (this.position.x > width + this.r) {
      this.position.x = -this.r;
    } else if (this.position.x < -this.r) {
      this.position.x = width + this.r;
    }
    if (this.position.y > height + this.r) {
      this.position.y = -this.r;
    } else if (this.position.y < -this.r) {
      this.position.y = height + this.r;
    }
  }
}