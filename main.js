$(document).ready(function(){

	//setup player and ai objects
	var north = new DumbAI("Norman");
	var east = new DumbAI("Ernest");
	var west = new DumbAI("Wendy");
	var south = new Player(prompt("Please enter a player name:", "Player 1"), $("#south")[0]); 
	var match = new HeartsMatch(north, east, south, west);
	//start game
	match.run();
	
	// create player aesthetics
	$("#north p").html(north.getName() + "   B^)");
	$("#east p").html(east.getName() + "   :3");
	$("#west p").html(west.getName() + "   >:^{)");
	$("#south p").html(south.getName() + "   :)");

	//set starting scores to 0, must be independent of game start event
	$("#player_scores").append("<div class=\"score\"> "+ north.getName()+": 0"); 
	$("#player_scores").append("<div class=\"score\"> "+ east.getName() +": 0"); 
	$("#player_scores").append("<div class=\"score\"> "+ west.getName() +": 0"); 
	$("#player_scores").append("<div class=\"score\"> "+ south.getName() +": 0"); 
});

