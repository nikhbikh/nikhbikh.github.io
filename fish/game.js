/* 15-237 Homework 1
 * Nikhil Bikhchandani - nbikhcha
 * Jessica Lo - jlo1
*/


var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//quit and start control the state of the game.
//quit===false and start===true => instruction screen
//quit===false and start===false => game playing
//quit===true and start===false => end screen
var quit = false;
var start = true;
var timerDelay = 70;
var intervalId;

//keys is used to check which arrow keys are pressed at any given moment in time
var keys;

//amount the fish shrinks when it gets eaten
var shrinkFactor = 2;

var startingHeight = 25;
var startingHealth = 3;
var maxHealth = 20;
var playerScore;

//school is an array of Fish objects that are not the player.
var school;

//player is the Fish object that the user controls
var player;

//alpha is the alpha value of player
var alpha = 1;

//the colors that a fish in school can take
var colorArray = 	["blueviolet", "brown", "chocolate", "crimson", "darkgoldenrod", "orangered",
					"red", "salmon", "yellowgreen", "yellow", "tomato","magenta"]

					
//Called everytime the start menu appears -- resets the needed variables
function initializeGame() {
	player = new Fish(ctx, canvas.width/2, canvas.height/2, startingHeight, "right", "blue", 0, 0, startingHealth);
	school = [];
	playerScore = 100;
	alpha = 1;
	keys = [0,0,0,0];
}
function doStartStuff() {
	//show the main menu onto the canvas
	
	ctx.clearRect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = "#02b3df";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	showInstructions();
	initializeGame();
}

function showInstructions(){
	ctx.textAlign = "center";
	ctx.font = "50px Arial";
	ctx.fillStyle = "black";
	ctx.fillText("Instructions", canvas.width/2, canvas.height/10);
	ctx.font = "20px Arial";
	ctx.textAlign = "left";
	
	var instructionArray = [];
	instructionArray.push("You are the blue fish in the center of the screen.");
	instructionArray.push("Use arrow keys for control.");
	instructionArray.push("Eat smaller fish, swim away from bigger fish.");
	instructionArray.push("Your life and score is shown at the top.");
	instructionArray.push("Wanna win? Get 20 lives. Or lose.");
	instructionArray.push("Every time you eat a fish, you gain 10 points.");
	instructionArray.push("If you get eaten you lose 20 points.");
	instructionArray.push("Don't starve! You will fade away and eventually lose a life.");
	instructionArray.push("Reach 20 lives without getting eaten for a max score of 270.");

	for(var i = 0; i < instructionArray.length; i++)
		ctx.fillText(instructionArray[i], 10, canvas.height/5 + 30 *i);

	ctx.textAlign = "center";
	ctx.font = "50px Arial";
	ctx.fillText("Click anywhere to begin!!", canvas.width/2, canvas.height - 60);
}

//main Fish object, constructed with canvas 2d context, center point of fish, height of fish,
//fish color, x and y velocities, and health
//For the computer fish, xvel, yvel, and health are defaulted to 0, 0, and 1.
function Fish(ctx, cx, cy, height, direction, color, xvel, yvel, health){
	this.ctx = ctx;
	this.cx = cx;
	this.cy = cy;
	this.height = height;
	this.direction = direction;
	this.mouthRect = {x1 : undefined, y1 : undefined, x2 : undefined, y2 : undefined};
	this.bodyRect = {x1 :undefined, y1 : undefined, x2 :undefined, y2 :undefined};

	if(health === undefined){
		this.health = 1;
		if (xvel === undefined)
			this.xvel = 5;
		else
			this.xvel = xvel;
		this.yvel = 0;
	}
	//Fish is the player
	else{ 
		this.health = health;
		this.xvel = 0;
		this.yvel = 0;
	}
	this.color = color;
}

Fish.prototype.drawFish = drawFish;
Fish.prototype.moveX = moveX;
Fish.prototype.moveY = moveY;
Fish.prototype.grow = grow;
Fish.prototype.shrink = shrink;

function grow() {
	this.height += shrinkFactor;
	this.health++;
	playerScore += 10;
}
function shrink() {
	this.height -= shrinkFactor;
	this.health--;
	playerScore -= 20;
}

//velocity changes with acceleration (from keyEvent)
function moveY() {
	this.cy += this.yvel;
}
function moveX() {
	this.cx += this.xvel;
	if (this.xvel > 0) 
		this.direction = "right";
	else if (this.xvel < 0)
		this.direction = "left";
}

//use canvas functions to draw a fish
function drawFish() {
	this.ctx.fillStyle = this.color;
	this.ctx.beginPath();
	var theta1 = Math.PI*7/4;
	var theta2 = Math.PI*5/4;
	var z = this.height/2 / (1/Math.cos(Math.PI/2 + theta1) - 1);
	var radius = z + this.height/2;
    var y1 = this.cy + z;
	var y2 = this.cy - z;
	
	//Draw the body of the fish
    this.ctx.arc(this.cx, y1, radius, theta1, theta2, true);
	this.ctx.arc(this.cx, y2, radius, -theta1, -theta2, false);
	this.ctx.fill();
	
	//the tail (px, this.cy) is the tip
	var w = Math.sqrt(radius*radius - z*z);
	if (this.direction === "left") {
		w = -w;
	}
	var px = this.cx - w*0.8; 
	
	var topTail = this.cy - this.height/2;
	var bottomTail = this.cy + this.height/2;
	var widthTail = w/2;
	
	this.ctx.moveTo(px, this.cy);
	this.ctx.lineTo(px-widthTail, topTail);
	this.ctx.lineTo(px-widthTail, bottomTail);
	this.ctx.lineTo(px, this.cy);
	this.ctx.fill();
	
	//the eyeball
	this.ctx.beginPath();
	eyex = px + 3/2 * w;
	eyey = this.cy - this.height/6;
	
	mouthRectX = px + 3/2 * w;
	mouthRectY = this.cy;
	this.ctx.fillStyle = "black";
	this.ctx.arc(eyex, eyey, this.height/2*0.17, 0, 2 * Math.PI, true);
	this.ctx.fill();
	
	//the mouth rectangle used to check if a fish is eating another fish
	var mouthVal = Math.abs(w)/5;
	this.ctx.strokeStyle = "black";
	if (this.direction === "left") {
		this.mouthRect.x2 = eyex + mouthVal;
		this.mouthRect.x1 = this.mouthRect.x2 - 2*mouthVal;
	}
	else {
		this.mouthRect.x1 = mouthRectX - mouthVal;
		this.mouthRect.x2 = this.mouthRect.x1 + 2*mouthVal;
	}
	this.mouthRect.y1 = mouthRectY - mouthVal;
	this.mouthRect.y2 = this.mouthRect.y1 + 2*mouthVal;
	
	//the body rectangle used to check if a fish is eating another fish
	if (this.direction === "left") {
	this.bodyRect.x2 = px - widthTail;
	this.bodyRect.x1 = this.bodyRect.x2 + widthTail + 1.8*w;
	}
	else {
	this.bodyRect.x1 = px - widthTail;
	this.bodyRect.x2 = this.bodyRect.x1 + widthTail + 1.8*w;
	}
	this.bodyRect.y1 = topTail;
	this.bodyRect.y2 = this.bodyRect.y1 + this.height;
}


function drawMouth(fish) {
	var directionMultiplier = 1;
	if (fish.direction === "left") directionMultiplier = -1;
	var mouthCenterX = fish.cx + (fish.height*0.9) * directionMultiplier;
	var mouthCenterY = fish.cy;
	ctx.beginPath();
    fish.ctx.arc(mouthCenterX, mouthCenterY, fish.height/5, 0, Math.PI , false);
	fish.ctx.fillStyle = "white";
	fish.ctx.fill();
}

function drawSchool(){
	for(var i = 0; i < school.length; i++){
		school[i].drawFish();
	}
}

//changes the position of the school fish with time
function moveSchool(){
	for(var i = 0; i < school.length; i++){
		school[i].moveX();
	}
}

//ensures that there are always fish in the school.
function manageSchool(){
	var numSchoolFish = Math.floor(canvas.height * canvas.width / 25000);
	//Add new number of fishies
	while(school.length < numSchoolFish){
		var end = Math.floor(Math.random() * 2);
		var dir;
		if(end)
			dir = "right";
		else
			dir = "left";
		var randomVelocity = Math.floor(Math.random() * 20) +1;
		if(end) randomVelocity = -randomVelocity;
		var randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];
		var randomY = Math.floor(Math.random() * canvas.height);
		var randomSmOrBig= Math.random();
		var randomSize;
		if (randomSmOrBig < 0.40) {
			randomSize = 5 + Math.floor(Math.random() * (player.height - 10));
		}
		else {			
			randomSize = player.height + 5 + Math.floor(Math.random() * (player.height + 20));
		}
		school[school.length] = new Fish(ctx, end * canvas.width, randomY, randomSize, dir, randomColor, randomVelocity);
	}
	
	//delete the fish that are off the screen
	for(var i = 0; i < school.length; i++){
		if(school[i].cx > canvas.width || school[i].cx < 0)
			school.splice(i, 1);
	}
}

//keys array (value = 1 if key is pushed down, value = 0 if key is not)
//0: up
//1: down
//2: left
//3: right
function movePlayer(){
	var termVel = 10
	if(keys[0]){
		if(player.yvel > 0 || player.yvel >=  -termVel)
			player.yvel--;
	}
	if (keys[1]) {
		if(player.yvel < 0 || player.yvel <= termVel)
			player.yvel++;
	}
	if (!keys[0] && !keys[1]) {
		//decelerate
		if (player.yvel > 0) { //going down
			if (player.yvel === 1)
				player.yvel = 0;
			else
				player.yvel -=2;
		}
		// "<=" so that fish will always be sinking (due to gravity...)
		else if (player.yvel <= 0) {	//going up
			if (player.yvel === -1)
				player.yvel = 0;
			else
				player.yvel +=2;
		}
	}
	
	if(keys[2]){
		if(player.xvel > 0 || player.xvel >=  -termVel)
			player.xvel--;
	}
	if (keys[3]) {
		if(player.xvel < 0 || player.xvel <= termVel)
			player.xvel++;
	}
	if (!keys[2] && !keys[3]) {
		//decelerate
		if (player.xvel > 0) { //going right
			if (player.xvel === 1)
				player.xvel = 0;
			else
				player.xvel -=2;
		}
		else if(player.xvel < 0){	//going left
			if (player.xvel === -1)
				player.xvel = 0;
			else
				player.xvel +=2;
		}
	}
	if (player.bodyRect.x2 <= 0) 
		player.cx = canvas.width;
	else if (player.bodyRect.x1 >= canvas.width)
		player.cx = 0;
	if (player.bodyRect.y2 <= 0)
		player.cy = canvas.height;
	else if (player.bodyRect.y1 >= canvas.height)
		player.cy = 0;
		
	player.moveX();
	player.moveY();
}

function manageAttacks(){

	var vicinityRect = {x1: 0, y1: 0, x2: 0, y2: 0};
	var playerMouthIsVisible = false;
	vicinityRect.x1 = player.mouthRect.x1 - 20;
	vicinityRect.y1 = player.mouthRect.y1 - 20;
	vicinityRect.x2 = player.mouthRect.x2 + 20;
	vicinityRect.y2 = player.mouthRect.y2 + 20;

	
	for(var i = 0; i < school.length; i++) {
		
		var enemyVicRect = {x1: 0, y1: 0, x2: 0, y2: 0};
		enemyVicRect.x1 = school[i].mouthRect.x1 - 20;
		enemyVicRect.y1 = school[i].mouthRect.y1 - 20;
		enemyVicRect.x2 = school[i].mouthRect.x2 + 20;
		enemyVicRect.y2 = school[i].mouthRect.y2 + 20;
	
		if (player.health <= 0 || player.health >= maxHealth)
			return;
		
		if(school[i].color === "lightgray")
			continue;
			
		//check if player is near smaller fish
		if ((school[i].height <= player.height) && intersection(school[i].bodyRect, vicinityRect))
			playerMouthIsVisible = true;
		
		//check if bigger enemy is near player
		if ((school[i].height >= player.height) && intersection(enemyVicRect, player.bodyRect))
			drawMouth(school[i]);
		
			
			
		//check if player ate the enemy fish
		if ((school[i].height <= player.height) && intersection(school[i].bodyRect, player.mouthRect)) {
				school.splice(i,1);
				player.grow();
				alpha = 1;
		}
		//check if enemy ate player
		else if ((school[i].height > player.height) && intersection(player.bodyRect, school[i].mouthRect)){
				player.shrink();
				school[i].color = "lightgray";
				if(alpha > 0.2) alphas -= 0.0003;
				else{ 
					alpha = 1;
					player.shrink();
				}
		}
		else  {
			if(alpha > 0.2) alpha -= 0.0003;
			else{
				alpha = 1;
				player.shrink();
			}	
		}
		player.color = "rgba(0, 0, 255, "+ alpha +")";
	}
	
	if (playerMouthIsVisible) drawMouth(player);
}

function intersection(rect1, rect2){
		if(rect1.y2 < rect2.y1 || rect1.y1 > rect2.y2 || rect1.x2 < rect2.x1 || rect1.x1 > rect2.x2) {
			return false;
		}
		return true;
}

function drawInfo(){
	ctx.textAlign = "center";
	ctx.font = "20px Arial";
	ctx.beginPath();
	ctx.fillStyle = "black";
	ctx.fillText("Life: " + player.health, canvas.width/2, 30);
	ctx.fillText("Score: " + playerScore, canvas.width/2, 60);
}

//for displaying end screen
function checkIfWonOrLost() {

	if(player.health === maxHealth) {
		quit = true;
		//Show winner they won!
		
		ctx.textAlign = "center";
		ctx.font = "60px Arial";
		ctx.fillStyle = "rgba(0,50,0,.8)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "limegreen";
		ctx.fillText("YOU WON! (:", canvas.width/2, canvas.height/4);
		ctx.font = "40px Arial";
		ctx.fillStyle = "lightgray";
		ctx.fillText("Click to play again", canvas.width/2, canvas.height/4 + 70);
	}
	
	if(player.health <= 0) {
		quit = true;
		//Show player they lost
		
		ctx.textAlign = "center";
		ctx.font = "60px Arial";
		ctx.fillStyle = "rgba(50,0,0,.8)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		ctx.fillStyle = "red";
		ctx.fillText("YOU LOST ):", canvas.width/2, canvas.height/4);
		ctx.font = "40px Arial";
		ctx.fillStyle = "lightgray";
		ctx.fillText("Click to play again", canvas.width/2, canvas.height/4 + 70);
	}
}

function onTimer() {
	if(start){
		return;
	}
    if (quit){
		return;
	}
	
	//Run the game
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#02b3df";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	moveSchool();
	manageSchool();
	drawSchool();
	movePlayer();
	player.drawFish();
	checkIfWonOrLost();
	manageAttacks();
	drawInfo();
}
function onKeyDown(event) {
	if (quit) return;
	var qCode = 81;
	var upCode = 38;
	var downCode = 40;
	var leftCode = 37;
	var rightCode = 39;
	if (event.keyCode === qCode) {
		clearInterval(intervalId);
        // ctx.clearRect(0, 0, 400, 400);
        ctx.fillStyle = "rgba(128,128,128,0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
		quit = true;
	}
	else if(event.keyCode === upCode){
		keys[0] = 1;
	}
	else if(event.keyCode === downCode){
		keys[1] = 1;
	}
	else if(event.keyCode === leftCode){
		keys[2] = 1;
	}
	else if(event.keyCode === rightCode){
		keys[3] = 1;
	}
	
}


function onKeyUp(event) {
	if (quit) return;
	var upCode = 38;
	var downCode = 40;
	var leftCode = 37;
	var rightCode = 39;
	if(event.keyCode === upCode){
		keys[0] = 0;
	}
	else if(event.keyCode === downCode){
		keys[1] = 0;
	}
	else if(event.keyCode === leftCode){
		keys[2] = 0;
	}
	else if(event.keyCode === rightCode){
		keys[3] = 0;
	}
	
}

function onMouseClick(event) {
	//On menu screen click, start becomes false to run game
	if (start === true) {
		start = false;
	}
	
	if (quit === true) {
		quit = false;
		start = true;
		doStartStuff();
	}

}

function run(){
	canvas.addEventListener('keydown', onKeyDown, false);
	canvas.addEventListener('keyup', onKeyUp, false);
	canvas.addEventListener('click', onMouseClick, false);
	
    // make canvas focusable, then give it focus!
    canvas.setAttribute('tabindex','0');
    canvas.focus();
    intervalId = setInterval(onTimer, timerDelay);
	
}

doStartStuff();
run();
			