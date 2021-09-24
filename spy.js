var io;
var gameSocket;

var locations = ['Больница', 'Школа', 'Фестиваль', 'Стадион', 'Ресторан'];
var locationsIMG = ['hospital.jpg', 'school.jpg', 'festival.jpg', 'stadion.jpg', 'restoran.jpg'];

exports.initGame = function(sio, socket) {
	io = sio;
    gameSocket = socket;

    gameSocket.emit('connected', { message: "You are connected!" });


	gameSocket.on('hostCreateNewGame', hostCreateNewGame);
	gameSocket.on('hostRoomFull', hostPrepareGame);

	gameSocket.on('playerJoinGame', playerJoinGame);

	gameSocket.on('getGameRoles', giveGameRoles);

	gameSocket.on('playerReconectGame', playerReconectGame);
	gameSocket.on('reconecting', reconecting);


	//game
	gameSocket.on('sendMessage', sendMessage);
	gameSocket.on('gameStarted', gameStarted);

	gameSocket.on('setQuestion', setQuestion);
	gameSocket.on('setAnswer', setAnswer);

	gameSocket.on('startVotingForSpy', startVotingForSpy);

	gameSocket.on('voteNo', voteNo);
	gameSocket.on('voteYes', voteYes);
	
	gameSocket.on('sendVoteRez', sendVoteRez);
	gameSocket.on('allVoted', allVoted);
	gameSocket.on('setSpyRole', setSpyRole);
	gameSocket.on('setSpyLocation', setSpyLocation);
}

function hostCreateNewGame (data) {
	
	var thisGameId = ( Math.random() * 100000 ) | 0;
	console.log('game id = ' + thisGameId);

	data.gameId = thisGameId;
	data.mySocketId = this.id;

	this.emit('newGameCreated', data);

	this.join(thisGameId.toString());
}

function playerJoinGame (data) {
	var sock = this;

	if (io.sockets.adapter.rooms[data.gameId]) {
		data.mySocketId = sock.id;
		sock.join(data.gameId);
		io.sockets.in(data.gameId).emit('playerJoinedRoom', data);

	} else {
		console.log('error');
		this.emit('errorMess',{message: "This room does not exist."} );
	}
	
}

function playerReconectGame (data) {
	var sock = this;
	for (var i = 0; i < locations.length; i++) {
		if (locations[i] === data.gameLocation) {
			data.gameLocationIMG = locationsIMG[i];
			break;
		}
	}

	if (io.sockets.adapter.rooms[data.gameId]) {
		data.mySocketId = sock.id;
		sock.join(data.gameId);
		//io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
		this.emit('editPlayerInfo', data);
		this.emit('editReconectInfo', data);
	} else {
		console.log('error');
		this.emit('errorMess',{message: "This room does not exist."} );
	}
	
}

function reconecting (data) {
	io.sockets.in(data[0].gameId).emit('reconecting', data);
}

function hostPrepareGame(gameId) {
	var sock = this;
	var data = {
		mySocketId: sock.id,
		gameId: gameId
	};
	io.sockets.in(data.gameId).emit('beginNewGame', data);
}

function giveGameRoles(players) {

	var rnd = getRandomInt(0, players.length);	
	console.log('random =' + rnd);

	var sock = players[rnd].mySocketId;
	io.sockets.sockets[sock].emit('chengeSpyRole');
	io.sockets.sockets[players[0].mySocketId].emit('editSpyRole', rnd);

	var random = getRandomInt(0, locations.length);

	var gameLocation = locations[random];
	var gameLocationIMG = locationsIMG[random];

	players.gameLocation = gameLocation;
	players.gameLocationIMG = gameLocationIMG;

	for (var i = 0; i < players.length; i++) {
		io.sockets.sockets[players[i].mySocketId].emit( 'editPlayerInfo', { pPos: players[i].playerPosition, gameId: players[0].gameId, gameLocation: gameLocation, gameLocationIMG: gameLocationIMG } );
	}
	console.log(players);

	io.sockets.in(players[0].gameId).emit('startGame', players);
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function sendMessage(data) {
	io.sockets.in(data.gameId).emit('showMessage', data);
}


function gameStarted(data) {
	var interviewer = 0;
	var respondent = 1;
	for(var i = 0; i < data.length; i++) {
		if(data[i].playerPosition === 1) {
			interviewer = i;
		}
		if(data[i].playerPosition === 2) {
			respondent = i;
		}
	}

	editActivePlayers(data[0].gameId, interviewer);	
}

function sendMessageRoom(room, message) {
	io.sockets.in(room).emit('getGameMessage', message);
}

function editActivePlayers(room, inter) {
	io.sockets.in(room).emit('editActivePlayers', inter);
}

function startInterQuestion(room, inter, resp) {
	io.sockets.in(room).emit('startInterQuestion', {room: room, interviewer: inter, respondent: resp});
}

function setQuestion(data) {
	var message = '<div style="background: ' + data.players[data.interviewer].playerColor 
	+ '; color: #fff; border-radius: 5px;"><span>' 
	+ data.players[data.interviewer].playerName + ': </span> ' + data.message + '</div>';
	console.log('message : ' + message);

	sendMessageRoom(data.room, message);

	var getAnswerData = {
		interName: data.players[data.interviewer].playerName,
		interColor: data.players[data.interviewer].playerColor,
		interMess: data.message,
		respond: data.respondent
	};

	console.log('resp =' + data.respondent);
	io.sockets.sockets[data.players[data.respondent].mySocketId].emit('getAnswer', getAnswerData);
}

function setAnswer(data) {
	console.log(data.respondent);
	var message = '<div style="background: ' + data.players[data.respondent].playerColor 
	+ '; color: #fff; border-radius: 5px;>"<span>' 
	+ data.players[data.respondent].playerName + ': </span> ' + data.message + '</div>';

	sendMessageRoom(data.room, message);
	console.log('respondent = ' + data.respondent);
	editActivePlayers(data.room, data.respondent);
}

function startVotingForSpy(data) {
	io.sockets.in(data.room).emit('showVoteForSpy', data);
}

function voteNo(hostId) {
	io.sockets.sockets[hostId].emit('setVoteRez', '-');
}

function voteYes(hostId) {
	io.sockets.sockets[hostId].emit('setVoteRez', '+');
}

function sendVoteRez(data) {
	io.sockets.in(data.room).emit('updateVoteRez', data);
}

function allVoted(data) {
	console.log('index' + data.indexFor);
	console.log('yes = ' + data.yesCount + ' no = ' + data.noCount);
	var proc = (data.yesCount * 100) / (data.yesCount + data.noCount);
	console.log('proc = ' + proc);
	if ( proc > 50) {
		io.sockets.in(data.room).emit('updateVoteScreen', data.indexFor);
		io.sockets.sockets[data.socketIdFor].emit('getSpyRole');

	}	else {
		sendMessageRoom(data.room, '<div>Голосование завершилось со счетом: ' + data.yesCount + ' - За /' +
			data.noCount + ' - Против</div><div>Игра продолжается</div>');
		io.sockets.in(data.room).emit('continueGame');
	}

}

function setSpyRole(data) {
	var endGameMess = '';
	if(data.role==='Spyman') {
		endGameMess = 'ПОБЕДИЛИ МИРНЫЕ';
		data.spyWin = false;
	}	else if(data.role==='Default') {
		endGameMess = 'ПОБЕДИЛ ШПИОН';
		data.spyWin = true;
	}
	data.endGameMess = endGameMess;
	console.log(data.endGameMess);
	io.sockets.in(data.room).emit('endGame', data);


}

function setSpyLocation(data) {
	var message = '';
	if (data.location === data.locationSpy) {
		message = 'Шпион совершенно точно определил локацию - ' + data.location;
		data.spyWin = true;
	}	else {
		message = 'Шпион предположил локацию ' + data.locationSpy + ', но ошибся.';
		data.spyWin = false;
	}
	data.endGameMess = message;
	console.log(data.endGameMess);
	io.sockets.in(data.room).emit('endGameSpy', data);
}