var colors = ['#FFF200', '#0964D3', '#54156C', '#E34108', '#FFCB14',
			 '#FABD02', '#B2102C', '#66B132', '#54156C', '#003371', 
			 '#348A69', '#CDE017', '#54CE00', '#88114E'];

var fourPlayers = [1,2,3,4];

jQuery(function($) {

	var IO = {

		init: function() {
			IO.socket = io.connect();			
			IO.bindEvents();
		},

		bindEvents: function() {
			IO.socket.on('connected', IO.onConnected );
			IO.socket.on('newGameCreated', IO.onNewGameCreated );
			IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
			IO.socket.on('beginNewGame', IO.beginNewGame );
			
			IO.socket.on('errorMess', IO.error);
			
			IO.socket.on('chengeSpyRole', IO.chengeSpyRole);
			IO.socket.on('editSpyRole', IO.editSpyRole);
			IO.socket.on('startGame', IO.startGame);
			IO.socket.on('editPlayerInfo', IO.editPlayerInfo);
			IO.socket.on('editReconectInfo', IO.editReconectInfo);
			IO.socket.on('reconecting', IO.reconecting);

			//IO.socket.on('reconectingInfo', IO.reconectingInfo);


			//game 
			IO.socket.on('showMessage', IO.showMess);
			IO.socket.on('getGameMessage', IO.getGameMessage);
			IO.socket.on('editActivePlayers', IO.editActivePlayers);
			IO.socket.on('startInterQuestion', IO.startInterQuestion);
			IO.socket.on('getAnswer', IO.getAnswer);

			IO.socket.on('showVoteForSpy', IO.showVoteForSpy);
			IO.socket.on('setVoteRez', IO.setVoteRez);
			IO.socket.on('updateVoteRez', IO.updateVoteRez);
			IO.socket.on('continueGame', IO.continueGame);
			IO.socket.on('finishGame', IO.finishGame);
			IO.socket.on('updateVoteScreen', IO.updateVoteScreen);
			IO.socket.on('getSpyRole', IO.getSpyRole);
			IO.socket.on('endGame', IO.endGame);
			IO.socket.on('endGameSpy', IO.endGameSpy);
		},

		

		onConnected: function( ) {
			//App.mySocketId = IO.socket.socket.sessionid;
			console.log(IO.socket.id);

			console.log(document.cookie);
			//RECONECT
			if ( getCookie("activeGame") != "") {
				//console.log(document.cookie);

				if ( localStorage.getItem('data') ) {
					console.log('local storage');
					var data = JSON.parse( localStorage.getItem('data') );

					console.log( data );


					IO.socket.emit('playerReconectGame', {gameId : getCookie("gameId"), 
														pPos : getCookie("pPos"),
														gameLocation : getCookie("gameLocation") });
					//App.Player.loadGameTable(data);
				}	
				else console.log("storage null");	

			}
			else console.log("game not exist");

			

		},

		onNewGameCreated: function(data) {
			App.Host.gameInit(data);
		},

		playerJoinedRoom: function(data) {
			App[App.myRole].updateWaitingScreen(data);
		},

		beginNewGame: function(data) {
			//console.log(data);	
			App.Host.getGameRoles();
		},		

		error: function(data) {
			alert(data.message);
		},

		chengeSpyRole: function() {
			App.Player.gameRole = 'Spyman';
		},

		editSpyRole: function(data) {
			App.Host.players[data].gameRole = 'Spyman';	
		},

		startGame: function(data) {	
			App.Player.loadGameTable(data);
		},

		editPlayerInfo: function(data) {
			App.Player.playerPosition = data.pPos;
			//if(data.pPos === 1) App.Player.Game = true;
			App.Player.gameId = data.gameId;
			App.Player.gameLocation = data.gameLocation;
			App.Player.gameLocationIMG = data.gameLocationIMG;

			console.log('its editplayer');
			console.log(data);
			
		},

		editReconectInfo: function(data) {

			console.log('its reconect');
			

			var plmass = JSON.parse( localStorage.getItem('data') );		
			var index = 0;
			for(var i = 0; i < plmass.length; i++)
			{
				console.log('plmass[i].playerPosition = ' + plmass[i].playerPosition + '  |  App.Player.playerPosition = ' + App.Player.playerPosition);
				if (plmass[i].playerPosition == App.Player.playerPosition) {
					plmass[i].mySocketId = IO.socket.id;
					index = i;					
				}				
			}

			
			App.mySocketId = plmass[index].mySocketId;
			App.nickname = plmass[index].playerName;
			App.gameId = plmass[index].gameId;
			App.Player.playerColor = plmass[index].playerColor;
			App.Player.myName = plmass[index].playerName;

			console.log('App.Player.gameRole' + App.Player.gameRole);

			IO.socket.emit('reconecting', plmass);			
			App.Player.loadGameTable(plmass);			
		},

		reconecting: function(data){

			App.Player.playersInfo = data;
			localStorage.setItem('data', JSON.stringify(App.Player.playersInfo));

			console.log(App.Player.playersInfo);
		},

		//game
		showMess: function(data) {
			App.Player.showMessage(data);
		},

		getGameMessage: function(data) {
			App.Player.Game.showGameMessage(data);
		},

		editActivePlayers: function(inter) {
			App.Player.Game.interviewer = inter;
			//App.Player.Game.respondent = data.respondent;
		
			if(App.Player.playerPosition == (App.Player.playersInfo[inter].playerPosition)) {
				App.Player.Game.yourActive = true;
			}	else {
				App.Player.Game.yourActive = false;
			}
			console.log('App.Player.playerPosition ' + App.Player.playerPosition + "App.Player.playersInfo[inter].playerPosition" + App.Player.playersInfo[inter].playerPosition);
			console.log('check active: ' + App.Player.Game.yourActive);

			$('.table-body-player-card-preview').removeClass('activePlayer').css('background-color', '');
			$('.table-body-player-card-preview .table-body-player-card-actions > div').css('display', 'flex');

			$('.card-player-' + App.Player.playersInfo[inter].playerPosition).children().addClass('active').css('background-color', App.Player.playersInfo[inter].playerColor);
			$('.card-player-' + App.Player.playersInfo[inter].playerPosition + '.table-body-player-card-actions > div').css('display', 'none');
			
			console.log('inter' + App.Player.Game.interviewer + ' resp' + App.Player.Game.respondent + ' active' + App.Player.Game.yourActive);
			document.cookie = "interviewer="+App.Player.Game.interviewer+"; max-age=120";

		},

		getAnswer: function(data) {
			App.Player.Game.getAnswer(data);
		},

		startInterQuestion: function(data) {
			//App.Player.Game.startInterQuestion(data);
		}, 

		showVoteForSpy: function(data) {
			App.Player.Game.showVoteForSpy(data);
		}, 

		setVoteRez: function(mess) {
			if (mess === '+') App.Host.yesVoteCount++;
				else if (mess === '-') App.Host.noVoteCount++;	

			IO.socket.emit('sendVoteRez', {room: App.Player.gameId, yesCount: App.Host.yesVoteCount, noCount: App.Host.noVoteCount});
			
			var voteTotal = App.Host.yesVoteCount + App.Host.noVoteCount;
			if( voteTotal === App.Player.playersInfo.length ) {
				console.log('all = ' + (App.Host.yesVoteCount + App.Host.noVoteCount) + ' length = ' + App.Player.playersInfo.length);
				console.log('indexP = ' + App.Player.playersInfo[App.Player.Game.indexVoteFor].mySocketId);
				var data = {
					room: App.Player.gameId,
					noCount: App.Host.noVoteCount,
					yesCount: App.Host.yesVoteCount,
					indexFor: App.Player.Game.indexVoteFor,
					socketIdFor: App.Player.playersInfo[App.Player.Game.indexVoteFor].mySocketId
				};
				IO.socket.emit('allVoted', data);
			} 
			
				
		},

		updateVoteRez: function(data) {
			App.Player.Game.showVoteRez(data);
		},

		continueGame: function() {
			$('.voting-container').css('display', 'none');
			App.Host.yesVoteCount = 0;
			App.Host.noVoteCount = 0;
		},

		finishGame: function() {
			//$('.voting-container h2').html('Большинство Проголосовало');
		},

		updateVoteScreen: function(index) {
			$('.voting-container').html('');
			console.log('index = ' + index);
			$('.voting-container').append('<h2>Большинство проголосовало за игрока '+App.Player.playersInfo[index].playerName+'</h2>');
			$('.voting-container').append('<p>Его роль - <span class="gameRole"></span></p>');
		},


		getSpyRole: function() {
			IO.socket.emit('setSpyRole', {role: App.Player.gameRole, room: App.Player.gameId});
		},

		endGame: function(data) {
			var role = '';
			if (data.spyWin === false) role = 'ШПИОН';
				else role = 'МИРНЫЙ';
			$('span.gameRole').html(role);
			$('.voting-container').append('<h2>'+data.endGameMess+'</h2>');

		},

		endGameSpy: function(data) {
			$('.voting-container').css('display', 'block');
			$('.voting-container').html('<h2>Игрок '+data.spyName+' раскрывает свою роль ШПИОНА</h2>' + 
				'<p>'+data.endGameMess+'</p>');
			if(data.spyWin === true) $('.voting-container').append('<h2>ПОБЕДИЛ ШПИОН</h2>');
				else $('.voting-container').append('<h2>ПОБЕДИЛИ МИРНЫЕ</h2>');

		}


		
	};

	var App = {

		gameId: 0,
		myRole: '',
		mySocketId: '',
		nickname: 'anon',

		init: function() {
			App.cacheElements();
			App.bindEvents();
		},

		cacheElements: function() {
			App.$doc = $(document);
			App.$nicknameInp = $('#nickName');
		},

		bindEvents: function() {
			App.$doc.on('click', '#room1', App.Host.onCreateClick);
			App.$doc.on('click', '#connTable', App.Player.onPlayerStartClick);

			//game
			App.$doc.on('click', '#sendMail', App.Player.sendMail);

			App.$doc.on('click', '.table-body-player-card.player-locked .actions-ask', App.Player.Game.startInterQuestion);
			App.$doc.on('click', '#inter-resp_button', App.Player.Game.interRespButton);

			App.$doc.on('click', '.voting-spy-btn', App.Player.Game.startVoting);
			App.$doc.on('click', '#spy-vote-location', App.Player.Game.pickLocation);

			App.$doc.on('click', '#yesBtn', App.Player.Game.yesBtnPush);
			App.$doc.on('click', '#noBtn', App.Player.Game.noBtnPush);
			App.$doc.on('click', '#setSpyLocation', App.Player.Game.setSpyLocation);
		},


		Host : {

			players : [],
			numPlayersInRoom: 0,
			yesVoteCount: 0,
			noVoteCount: 0,

			onCreateClick: function() {

				plCol = App.getPlayerColor();
				App.Player.playerColor = plCol;

				var data = {		
					playerName : $('#nickName').val() || 'anon',
                    playerColor : plCol,
                    gameRole: App.Player.gameRole,
                    //playerPosition: 0
                };

                //App.playerPositionNumber = 0;
                App.Player.myName = data.playerName;

				IO.socket.emit('hostCreateNewGame', data);
			},

			gameInit: function(data) {

				App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 1;

                App.Host.players.push(data);

                App.Host.displayLobbyScreen(data);

				console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);

			},

			displayLobbyScreen: function(data) {
				$.ajax({  
		            url: "lobby.html",
		            cache: false,  
		            success: function(html){  
		                $("#createGameScreen-box").html(html); 
		                //$('#player1 span').html(data.playerName); 
		                $('#player1').addClass('playerJoined');
		                $('#player1 span').html('<img src="./img/joined.png">'); 
		                //$('#currCount').html('1');
		                $('#roomId').html(App.gameId);
		            }  
		        }); 
			},

			updateWaitingScreen: function(data) {
				App.Host.numPlayersInRoom += 1;
				

				$('#currCount').html(App.Host.numPlayersInRoom);
				//$('#player' + App.Host.numPlayersInRoom + ' span').html(data.playerName);				
				$('#player' + App.Host.numPlayersInRoom).addClass('playerJoined');
				$('#player' + App.Host.numPlayersInRoom + ' span').html('<img src="./img/joined.png">');

				App.Host.players.push(data);
				if(App.Host.numPlayersInRoom === 4) {

					IO.socket.emit('hostRoomFull', App.gameId);
					//App.myRole = 'Player';
				}				
			},

			getGameRoles: function() {

				fourPlayers = App.shuffle(fourPlayers);
				for(var i = 0; i < App.Host.players.length; i++) {
					App.Host.players[i].playerPosition = fourPlayers[i];
				}
				
				console.log(App.Host.players[0].playerName);
				IO.socket.emit('getGameRoles', App.Host.players);
			}

		},

		Player : {

			gameId: '',
			myName: '',
			gameRole: 'Default',
			playerPosition: 0,
			playerColor: '#000',
			gameLocation: '',
			gameLocationIMG: '',
			playersInfo: [],

			onPlayerStartClick: function() {
				
				var plCol = App.getPlayerColor();
				App.Player.playerColor = plCol;
				

				var data = {
                    gameId : +($('#keyTable').val()),
                    playerName : $('#nickName').val() || 'anon',
                    playerColor : plCol,
                    gameRole: App.Player.gameRole
                };

				IO.socket.emit('playerJoinGame', data);

				App.myRole = 'Player';
                App.Player.myName = data.playerName;

			},

			updateWaitingScreen: function(data) {
				$('#connTable').html('Идет поиск игроков').attr('disabled', 'disabled');
			},

			loadGameTable: function(playersArr) {


				//console.log('full data');
				//console.log(playersArr);
				App.Player.playersInfo = playersArr;

				$.ajax({  
		            url: "game.html",
		            cache: false,  
		            success: function(html){  
		                $("#content-area").html(html); 

		                for(var i = 0; i < playersArr.length; i++) {
		                	var $currPlayer = $('.card-player-' + playersArr[i].playerPosition);
							$currPlayer.html( $('#palyer-template').html() );
							$currPlayer.addClass('player-locked');

							$currPlayer.find('.table-body-player-card-preview').css('border-color', playersArr[i].playerColor);
		                	$currPlayer.find('span.player-name').html(playersArr[i].playerName);
		                
		                }

		                $('.card-player-' + App.Player.playerPosition+' span.player-name').prepend('Вы - ');

		                $('.table-body-board-chat-messages').append('<div>Добро пожаловать в игру Шпион!</div>');
		       
				        App.Player[App.Player.gameRole].show();
				        $('.table-body-board-chat-messages').append('<div>Игра начинается</div>');

				      	
						

						//IO.socket.emit('gameStarted', playersArr);

				      	if ( getCookie("activeGame") != "") {
				      		console.log('active game is - ' + getCookie("activeGame"));	
				      		IO.editActivePlayers(getCookie('interviewer'));	
				      				        	
						}
						else {
							IO.socket.emit('gameStarted', playersArr);
							console.log('gameStarted');
						}
				        
						//cookies
				      	setCookies(App.Player.myName, App.Player.gameId, App.Player.playerPosition, App.Player.gameLocation);
				      	console.log(document.cookie);
				      	localStorage.setItem('data', JSON.stringify(playersArr));
				        

		            }  
		        }); 


			},

			Default: {				
				show: function(){
					console.log('hello im deff');
					$('.location-box').css('display','block');
					$('.location-box-spy').css('display','none');

					$('#gamelocation').html(App.Player.gameLocation);
					$('img.location-img').attr('src', 'img/' + App.Player.gameLocationIMG);
					$('.table-body-board-chat-messages').append('<div>Вычислите шпиона</div>');
				},

				startVotingForSpy: function(voteFor) {
					//$('.voting-container').css('display', 'block');
					console.log('votefor: ' + voteFor);
					IO.socket.emit('startVotingForSpy', {voteWho: App.Player.myName, voteWhoColor: App.Player.playerColor, voteFor: App.Player.playersInfo[ voteFor - 1 ].playerName, voteForColor: App.Player.playersInfo[ voteFor - 1 ].playerColor, room: App.Player.gameId, indexVoteFor: (voteFor-1)});
					console.log(App.Player.myName + ' выставляет на голосование игрока ' + voteFor);
				}
			},

			Spyman : {
				show: function(){
					console.log('hello im spy');
					$('.location-box').css('display','none');
					$('.location-box-spy').css('display','flex');

					$('#gamelocation').html('шпион');
					$('.table-body-board-chat-messages').append('<div>Отгадайте локацию</div>');
					
					
					$('.card-player-' + App.Player.playerPosition + ' .voting-spy-btn').addClass('spyBtn');
			
				},

				spyAnswer: function() {
					$('.picklocation-box').css('display', 'block');				
				}

			},

			sendMail: function() {
				var message = $('#textMessage').val();

				var messageData = {
					gameId: App.Player.gameId,
					sender: App.Player.myName,
					message: message,
					playerColor: App.Player.playerColor
				}

				IO.socket.emit('sendMessage', messageData);
				$('#textMessage').val('');
			}, 

			showMessage: function(data) {
				console.log(data);
				$('.table-body-board-chat-messages').append('<div> <span style="color:' + data.playerColor + ';">' + data.sender + ': </span>' + data.message + '</div>');
			},

			Game: {

				yourActive: false,
				interviewer: 0,
				respondent: 1,
				indexVoteFor: 0,				

				showGameMessage: function(message) {
					$('.table-body-board-chat-messages').append(message);
				},

				startInterQuestion: function() {
					var $popUp = $('.inter-resp-box');



					if(App.Player.Game.yourActive === true) {
						for(var i = 1; i <= 4; i++) {
							if( $(this).parent().parent().parent().hasClass('card-player-' + i) == true)
							{
								if (i != App.Player.playerPosition) {	
									
									for(var j = 0; j < App.Player.playersInfo.length; j++) {
										if(App.Player.playersInfo[j].playerPosition == i) {
											App.Player.Game.respondent = j;
											break;
										}
									}

									$popUp.css('display', 'block');
									$popUp.find('h3 span').html(App.Player.playersInfo[App.Player.Game.respondent].playerName).css('color', App.Player.playersInfo[App.Player.Game.respondent].playerColor);
									break;
								}
							}
						}	
						console.log('resp = ' + App.Player.Game.respondent);					
					}
				},

				getAnswer: function(data) {
					var $popUp = $('.inter-resp-box');
					$popUp.css('display', 'block');
					$popUp.find('h3').html(data.interMess);	
					App.Player.Game.respondent = data.respond;		
				},

				interRespButton: function() {
					var $popUp = $('.inter-resp-box');
					
					var questionData = {
						room: App.Player.gameId,
						interviewer: App.Player.Game.interviewer,
						respondent: App.Player.Game.respondent,
						players: App.Player.playersInfo,
						message: $popUp.find('textarea').val()
					};

					console.log('question data');
					console.log(questionData.players);

					if(App.Player.Game.yourActive === true) {

						console.log('room: ' + App.Player.gameId);

						IO.socket.emit('setQuestion', questionData);						
						App.Player.Game.yourActive = false;						

					}	else {
						console.log('setQuestion  resp = ' + App.Player.Game.respondent);
						IO.socket.emit('setAnswer', questionData);
					}

					$popUp.css('display', 'none');
					$popUp.find('textarea').val('');
				},

				startVoting: function(event) {
					event.preventDefault();

					var voteFor = 0;

					for(var i = 1; i <= 4; i++) {
						if( $(this).parent().parent().parent().hasClass('card-player-' + i) ) voteFor = i;
					}

					if ($(this).hasClass('spyBtn') ) { App.Player.Spyman.spyAnswer(); }
						else { App.Player.Default.startVotingForSpy(voteFor); }

				},
				pickLocation: function() {
					App.Player.Spyman.spyAnswer();
				},

				showVoteForSpy: function(data) {
					$('.voting-container').css('display', 'block');
					$('.voting-container .voting-container-box p').html('<span style="color:' + data.voteWhoColor + '">' + data.voteWho + '</span>' + ' думает что <span style="color:' + data.voteForColor + '">' + data.voteFor + '</span> - ШПИОН');
					
					$('.voteBtn').removeAttr('disabled');
					App.Player.Game.indexVoteFor = data.indexVoteFor;
				},

				noBtnPush: function(event) {
					event.preventDefault();
					IO.socket.emit('voteNo', App.Player.playersInfo[0].mySocketId);
					$('.voteBtn').attr('disabled', 'disabled');

				},

				yesBtnPush: function(event) {
					event.preventDefault();
					IO.socket.emit('voteYes', App.Player.playersInfo[0].mySocketId);
					$('.voteBtn').attr('disabled', 'disabled');
				},

				showVoteRez: function(data) {
					$('.voting-container #yesCount').html(data.yesCount);
					$('.voting-container #noCount').html(data.noCount);
				},

				setSpyLocation: function() {
					console.log('location = ' + App.Player.gameLocation);
					var data = {
						locationSpy: $('input#locList').val(),
						location: App.Player.gameLocation,
						spyName: App.Player.myName,
						room: App.Player.gameId
					};
					IO.socket.emit('setSpyLocation', data);
				}

			}
		},

		getPlayerColor: function () {
			return colors[App.getRandomInt(0, colors.length)];
		},

		getRandomInt: function(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min)) + min;
		},

		shuffle: function(arr) {

			var j, temp;
			for(var i = arr.length - 1; i > 0; i--) {
				j = Math.floor(Math.random()*(i + 1));
				temp = arr[j];
				arr[j] = arr[i];
				arr[i] = temp;
			}

			return arr;
		}



	}

	function setCookies(name, gameid, position, location) {
		document.cookie = "activeGame="+true+"; max-age=120";
		document.cookie = "name="+name+"; max-age=120";
		document.cookie = "gameId="+gameid+"; max-age=120";
		document.cookie = "pPos="+position+"; max-age=120";
		document.cookie = "gameLocation="+location+"; max-age=120";
	}

	
	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}


	IO.init();
	App.init();

}($));