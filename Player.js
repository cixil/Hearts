var Player = function (name, ui_div) {
	var match = null;
	var position = null;
	var current_game = null;
	var pkey = null;
	
	//CONSTANTS 
	var height = -94; //height of card in img/cards.gif --94
	var width = -69; //width of card in img/cards.gif  --69
	var image = "img/cards.png"; 
	
	// Required Functions	
	this.setupMatch = function (hearts_match, pos) {
		match = hearts_match;
		position = pos;
	}
	this.getName = function() {
		return name;
	}
	this.setupNextGame = function (next_game, player_key) {
		current_game = next_game;
		pkey = player_key;
		play();
	}
		
	//My added functions
	this.getKey = function(){
		return pkey;
	}

	this.getCurrentGame = function() {
		return current_game;
	}

	function play(){
		//variables for ease of reference
		var hand;
		var cards = [];
		var validCards = [0,1,2,3,4,5,6,7,8,9,10,11,12];
		var selectedCards = [];
		var c_selected = "img/red.png"
		var c_invalid = "img/white.png"
		var c_valid = "img/trans.gif"

		var northName = 'Norman', westName = 'Wendy', eastName = 'Ernest';

		var tricknum = 0;
		var ntrick = 0, strick = 0, wtrick = 0, etrick = 0;
		var nscore = 0; sscore = 0; wscore = 0, escore = 0;
	
	// function to communicate to user through message div
		function log(message){
			$("#log").prepend("<p>" + message + "</p>");
		}
		
		function log(message, color){
			$("#log").prepend("<p style=\"background-color: "+color+"\">" + message + "</p>");
		}

	// CARD FUNCTIONS
		function displayHand(h) {
			var to, left, rank, suit;
			
			$("#south .hand").empty(); //remove existing cards
			for (i=0; i<h.length; i++){
				$("#south .hand").append(cardHTML(h[i], i));
			}
		}

		function appendCardBack( pos ) {
			var left = 0, to = 0; //position of red card back from my image
			var style = " style=\"width: " + width + "; height: " + height + 
			"; background: url(" + image + ") " + left + "px " + to + "px; \"";

			var cardBackHTML = "<div class=\"ai_card\"><img src=\"" + c_valid + "\" alt=\"back of card\"" + style  + "/></div>";
			for (var i = 0; i < 13; i++){
				$(pos).append(cardBackHTML);
			}
		}

		function cardHTML(card, id){
			rank = card.getRank();
			suit = card.getSuit();
				switch (suit){
					case 0: //heart
					to = height*2; break;
					case 1: //spade
					to = height*3; break; 
					case 2: //diamond
					to = height; break;
					case 3: //club
					to = 0;
				}
				left = rank*width;
				if (rank==14){ //had to make special case for Ace, because I'm too lazy to change the card image
					left = width;
				}

			var style = " style=\"width: " + width + "; height: " + height + 
			"; background: url(" + image + ") " + left + "px " + to + "px; \"";

			return "<div class=\"card\" id=" + id + "><img src=\"" + c_valid + "\" alt=\"" + suit + " " + rank
				+"\"" + style + '/></div>'; //id and alt are used to reference cards later
		}
		
		var isValid;
		function selectCard(id) {
			isValid = false;
			for (i in validCards) { if (validCards[i] == id) { isValid=true; break;}} 
			if (!isValid) { 
				log("Choose a valid card!");
				return;
			}
			
			selectedCards.push(hand[id]);
			cards.push(id);
			$("#" + id + " img").attr('src', c_selected);
			//$("#" + id).animate({top: '+=250px'});
		}

		function deselectCard(id) {
			selectedCards.pop(hand[id]);
			cards.pop(id);
			$("#" + id + " img").attr('src', c_valid);
		}

		function emptyCards() {
			for (var i = 0; i <= cards.length + 1; i++){
				deselectCard(cards[0]);
			}
		}

		function validateCards(){
			var h = current_game.getHand(pkey);
			var playableCards = h.getPlayableCards(pkey);
			var validID;
			validCards = [];

			// gray out all cards
			for (var id = 0; id < h.getUnplayedCards(pkey).length; id++){
				$("#" + id + " img").attr('src', c_invalid);
			}
			// make valid cards visible
			for (var id = 0; id < h.getUnplayedCards(pkey).length; id++){
				for (var vid = 0; vid < playableCards.length; vid++) {
					validID = playableCards[vid].getSuit() + " " + playableCards[vid].getRank();
					
					if (validID == $("#" +  id + " img").attr('alt')) {
						$("#" + id + " img").attr('src', c_valid);
						validCards.push(id); 
					}
				}
			}
		}

		function updateTricks(){
			$("#score_board .score").html("Tricks Won:");
			$("#player_tricks").html("");
			$("#player_tricks").append("<div class=\"score\"> "+ northName +":\t" + ntrick); 
			$("#player_tricks").append("<div class=\"score\"> "+ eastName +":\t" + etrick);
			$("#player_tricks").append("<div class=\"score\"> "+ westName +":\t" + wtrick);
			$("#player_tricks").append("<div class=\"score\"> " + name +":\t" + strick);
		}

		function changeButton(text, cl){
			$('#main').text(text);
			$('#main').attr("class", cl);
		}
		
		$('#main').on('click', function() {
			cl = $('#main').attr('class');
			switch (cl){
				case 'game_start':
					if (selectedCards.length < 3){ log("Select three cards!");}
					else {
						current_game.passCards(selectedCards, pkey);
					}
					break;
				case 'trick' :
					if (selectedCards.length ==0){ log("Select a card!")}
					else {
						current_game.playCard(selectedCards[0], pkey);
					}
			}
		}); //I had to separate the click function from the event handlers, because they all went off at once



		//********************************************** Game Events ***************************************************\\
		
		//GAME_STARTED_EVENT
		current_game.registerEventHandler(Hearts.GAME_STARTED_EVENT, function(e){
			appendCardBack(".player#north .hand");
			appendCardBack(".player#east .hand");
			appendCardBack(".player#west .hand");
			
			updateTricks();
			changeButton('Pass', 'game_start');				

			log("Pass 3 cards to the left");
			hand = current_game.getHand(pkey).getDealtCards(pkey);
			displayHand(hand);

			if (e.getPassType() != current_game.PASS_NONE){ // if player has to pass cards
				$('.card').on('click', function(){
					click: {
						for (var i = 0; i< selectedCards.length; i++){
							if (cards[i]==this.id){
								deselectCard(this.id);
								break click; //prevents card from being selected after deselection
							}
						}
						if (selectedCards.length < 3) {
							selectCard(this.id);
						}
						else {
							log("You can only select 3 cards.");
						}
					}
				});
			}
		});

		//PASSING_COMPLETE_EVENT
		current_game.registerEventHandler(Hearts.PASSING_COMPLETE_EVENT , function(e){
			log("Passing complete.");
			hand = current_game.getHand(pkey).getUnplayedCards(pkey);
			displayHand(hand);
			emptyCards();
		});

		//TRICK_START_EVENT
		current_game.registerEventHandler(Hearts.TRICK_START_EVENT , function(e){

			if (e.getStartPos() == "South"){
				changeButton("Play", 'trick');
				validateCards();
				log("Start the trick!");
				$('.card').on('click', function(){
					if (selectedCards.length == 1){
						emptyCards();	
					}
					selectCard(this.id);
				});
			}
		});

		//CARD_PLAYED_EVENT
		current_game.registerEventHandler(Hearts.CARD_PLAYED_EVENT , function(e){

			function removeCard( pos ){
				var selector ="#"+pos+" .ai_card:first-child";
				$(selector).remove();
			}	
			var card = e.getCard();
			switch(e.getPosition()){
				case "North":
					removeCard("north");
					$("#card_table").delay(1000).append(cardHTML(card, "n"));
					break;
				case "East":
					removeCard("east");
					$("#card_table").append(cardHTML(card, "e"));	
					break;
				case "West":
					removeCard("west");
					$("#card_table").append(cardHTML(card, "w"));	
					break;
				case "South":
					$(cards[0]).animate({left: '200px'});//why no work?
					$("#card_table").append(cardHTML(card, "s"));
					hand = current_game.getHand(pkey).getUnplayedCards(pkey);
					displayHand(hand);
					emptyCards(); //resets selections
			}
		});

		//TRICK_CONTINUE_EVENT
		current_game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, function(e){
			if (e.getNextPos() == "South"){
				changeButton("Play", 'trick');
				validateCards();
				log("It's your turn!");
				$('.card').on('click', function(){
					if (selectedCards.length == 1){
						emptyCards();	
					}
					selectCard(this.id);
				});
			}
		});

		//TRICK_COMPLETE_EVENT
		current_game.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, function(e){			
			tricknum++;
			log("Trick Complete. " + (13-tricknum) + " tricks remaining.", '#ff9999');
			$("#card_table").html(''); // clear cards
			
			switch (e.getTrick().getWinner()){
				case 'North': ntrick ++;
				      	      break;
				case 'East':  etrick ++;
				      	      break;
				case 'West':  wtrick ++;
				      	      break;
				case 'South': strick ++;
			}
			updateTricks();
		});

		//GAME_OVER_EVENT
		current_game.registerEventHandler(Hearts.GAME_OVER_EVENT, function(e){			
			$("#score_board .score").text("Final Scores:");
			$("#player_scores").html("");
			var scoreboard = match.getScoreboard();
			
			nscore += scoreboard[Hearts.NORTH];
			escore += scoreboard[Hearts.EAST];
			wscore += scoreboard[Hearts.WEST];
			sscore += scoreboard[Hearts.SOUTH];

			var winner = Math.min(nscore, escore, wscore, sscore);
			switch (winner) {
				case nscore:
					winner = northName; break;
				case escore:
					winner = eastName; break;
				case wscore:
					winner = westName; break;
				case sscore:
					winner = name;
			}

			$("#player_scores").html("");
			$("#player_scores").append("<div class=\"score\"> "+ northName+": " + nscore); 
			$("#player_scores").append("<div class=\"score\"> "+ eastName +": " + escore); 
			$("#player_scores").append("<div class=\"score\"> "+ westName +": " + wscore); 
			$("#player_scores").append("<div class=\"score\"> "+ name +": " + sscore); 

			alert(winner +" is winning!");
			log("Game over. " + winner + " won. Starting new round.");
			
			//reset trick tallies
			ntrick = 0; etrick = 0; wtrick = 0; strick = 0;
		});
	}
}
