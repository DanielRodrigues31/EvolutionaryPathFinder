let vehicles = []; // stores current generation of vehicles
let path; // path placeholder
let generations = 50; // sets max generations
let generation = 0; //  sets current generation to 0

let upperMS = 15; // sets upper maxSpeed
let upperMA = 15; // sets upper maxAngle
let upperVis = 30; // sets upper vision 

let lowerMS = 3; // sets lower maxSpeed
let lowerMA = 3; // sets lower maxAngle
let lowerVis = 5; // sets lower vision

let fastTrail;  // optimised path placeholder

/* Ran by the IDE on startup */
function setup() {
  createCanvas(1000, 990); // creats canvas
  Initialise_Path();
  
  for (var i = 0; i < 10; i++){
    var dna = [];
    dna[0] = random(lowerMS, upperMS); // maxSpeed
    dna[1] = random(lowerMA, upperMA); // maxAngle
    dna[2] = random(lowerVis, upperVis); // vision
    vehicles[i] = new Vehicle(i, dna);
  }
}

/* draws properties to the canvas */
function draw() {
  background(0);
  path.output();
  
  if (generation < generations){
    
  let completed = 0;
  
  for (var i = 0; i < vehicles.length; i++){
    vehicles[i].main(path);
    if (vehicles[i].finished == true){
      completed += 1;
      if (completed == 10){
        generation += 1;
        nextgen = New_Generation();
        //console.log("generation: ",generation)
        for (var y = 0; y < 10; y++){
          vehicles[y] = new Vehicle(y, nextgen[y]);
          }
        }
      }
    }
  }
  else{
    outputTrail();
  }
}

/* Initalises a new path with declared nodes */ 
function Initialise_Path() {
  path = new Path();
  let offset = 60; // margin from the edges
  path.set_point(offset, height/2); // declares new points relative to the window
  path.set_point(offset, offset);
  path.set_point(width - offset * 11, offset);
  path.set_point(width - offset * 8, offset * 2.5);
  path.set_point(width - offset * 5, offset);
  path.set_point(width - offset, offset);
  path.set_point(width - offset * 9, offset * 7);
  path.set_point(width - offset * 11, offset * 11);
  path.set_point(width - offset, offset * 11);
  path.set_point(width - offset, height - offset);
  path.set_point(width - offset * 13 , height - offset);
  path.set_point(offset, height - offset*5);
}

/* Initalises new generation in genetic algorithm */
function New_Generation(){
  var scores = []; // stores scores of current generation
  var times = []; // stores times of current generation
  var fitness = []; // stores fitness values of current generation
  var parents = []; // stores mating pool 
  var next_gen = []; // stores generated next generation
  var scores_norm = []; // stores normalised scores
  var times_norm = []; // stores normalised times
 
  for (var i = 0; i < vehicles.length; i++){ // iterates through current generation
    var finish = vehicles[i].finish(); // stores vehicles that have finished the race
    scores[i] = finish[0]; // stores their scorws
    times[i] = finish[1]; // stores their times
    }
  if (isEqual(scores) == true){ // contingency for normalisation, if all elements are equal min max norm isnt possible.
    scores_norm = [1,1,1,1,1,1,1,1,1,1]; 
  }
  else{
    scores_norm = scores.map(Normalize(Math.min(...scores),Math.max(...scores))); // normalise scores using min max
  }
  
  if (isEqual(times) == true){
    times_norm = [1,1,1,1,1,1,1,1,1,1];
  }
  
  else{
    times_norm = times.map(Normalize(Math.max(...times),Math.min(...times))); // normalise times using min max
  }

  fitness = Calculate_Fitness(scores_norm, times_norm); // calculate fitness of current generation
  result(scores, times, fitness) // output results
  
  if (generation == generations){ // if generation is the last generation, get the fastest trail
    var fastest = fitness.indexOf(Math.max(...fitness)); // highest fitness vehicle's index
    fastTrail = vehicles[fastest].trail; // get fastest trail
  }
  
  for (var x = 0; x < vehicles.length; x++){ // iterate through vehicles
    var parent1 = PoolSelection(fitness); // store different parent 1 for each vehicle
    var parent2 = PoolSelection(fitness); // store different parent 2 for each vehicle
    next_gen[x] = Mutate(Crossover(parent1, parent2)); // Reproduce parents, mutate returned child then store as next generation
  }
  
  return next_gen // return next generation
}

/* Produces a fitness value for each element in scores and times
 * @param1 {int} times - normalised array of generation times
 * @param2 {int} scores - normalised array of generation scores
*/
function Calculate_Fitness(scores, times){
  var fitness = []; // stores fitness scores
  for (var i = 0; i < 10; i++){
    fitness[i] = ((scores[i]*2) + times[i]) / 2; // places double the weight on times 
  }
  return fitness;
}

/* Normalises arrays between 0 and 1 using min max
 * @param1 {int} minimum value out of array
 * @param2 {int} maximum value out of array
*/
function Normalize(min, max){
  var diff = max - min;
  return function (val){
    return(val - min) / diff;
  }
}

/* Iterates until fitness value is less than randomly generated value and returns vehicle dna
 * @param {int} array of fitness scores
*/
function PoolSelection(fitness){
  var error = 0; // error detection
  while(true){
    var index = floor(random(vehicles.length)); // random index in vehicle
    var prob = random(Math.max(...fitness)); // random element in fitness
    if (prob < fitness[index] + 0.0001){
      return vehicles[index].dna; // returns vehicle dna 
    }
    error++; // adds 1 to error
    // breaks out if while loop iteration is more than 10000
    if (error > 10000){
      return null;
    }
  }
}

/* Averages out each element from parent1 and 2 then returns a child
 * @param1 {int} parent1 - dna array
 * @param2 {int} parent2 - dna array
*/
function Crossover(parent1, parent2){
  var child = []; // declaring child array
  child[0] = (parent1[0] + parent2[0]) / 2;
  child[1] = (parent1[1] + parent2[1]) / 2;
  child[2] = (parent1[2] + parent2[2]) / 2;
  return child;
}

/* iterates through each element in dna with the chance of mutation
 * @param {int} child - dna array
*/
function Mutate(child){
  let rate = 0.10; // % chance
  for(var i = 0; i < child.length; i++){ 
    if (i == 0 && random(1) < rate){
      child[i] = random(lowerMS, upperMS) // random value between range
    }
    if (i == 1 && random(1) < rate){
      child[i] = random(lowerMA, upperMA) // random value between range
    }
    if (i == 2 && random(1) < rate){
      child[i] = random(lowerVis, upperVis) // random value between range
    }
    return child
  }
}

/* Checks if all elements in an array are equal
 * @param {int} array - array of fitness values
*/
function isEqual(array){
  for (let i = 1; i < array.length; i++) {
    if (array[i] !== array[0]) {
      return false;
    }
  }
  return true;
}

/* Output results for generation score and time average then 50th generation fastest lap time 
 * @param1 {int} scores - array of scores from current generation
 * @param2 {int} times - array of times from current generation
*/
function result(scores, times){
  if (generation <= generations){
    const sumtime = times.reduce((a, b) => a + b, 0);
    const averagetime = (sumtime / times.length) || 0;
    const sumscore = scores.reduce((a, b) => a + b, 0);
    const averagescore = (sumscore / times.length) || 0;
    
    console.log("generation", generation, ":", averagetime, ' ', averagescore, "\n");
  }
  if(generation == generations){
    console.log("Fastest lap", ":", Math.min(...times), ' ', Math.max(...scores), "\n");
  }
}
/* Outputs fastest trail in terminal and visual path representation on canvas */
function outputTrail(){
  //console.log(fastTrail);
  noFill();
  strokeJoin(ROUND);
  stroke(255, 0, 0)
  strokeWeight(5);
  //console.log(fastTrail);
  beginShape();
  for(let element of fastTrail){
    vertex(element.x, element.y);
  }
  endShape(CLOSE);
}
