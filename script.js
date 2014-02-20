//sp = getSpotifyApi(1);

//exports.init = init;
var api;
var backups = [
"spotify:track:3SP1LUtLle97QNFvFFopnG",
"spotify:track:2m2FrjkQrHxEfFxHujRqVo",
"spotify:track:6pLZEfSNKlVX0XNDgKYRqZ",
"spotify:track:6niRBdiIWLB8znJrsNvxOV",
"spotify:track:2stwPgrh5NpNr8PdiIPEhE",
"spotify:track:4AVxmpwfXH7p4YyTbg9nS4",
"spotify:track:3b6uenXXbpCRxXyzFzWi3J",
"spotify:track:13rs8zN46Bi5YVzS4T0mJe",
"spotify:track:6W96guiUjEduSKGZoJ4pRk",
"spotify:track:1uAnbQOgbO1Q7J479ElNp6",
"spotify:track:3DcC6fFDL3dIGsPQZA3fPL",
]

function nowPlaying() {
	xhr = new XMLHttpRequest()
	xhr.open("GET","http://listen.christianrock.net/currentsong?sid=1",false)
	xhr.send()
	//console.log(xhr.response)
	return doubleCheck(xhr.response)
}
function getSong(song) {
	xhr = new XMLHttpRequest()
	xhr.open("GET","http://ws.spotify.com/search/1/track.json?q="+encodeURIComponent(song),false)
	xhr.send()
	//console.log(xhr.response)
	return JSON.parse(xhr.response)
}
function playSong2() {
	songT = nowPlaying()
	songI = getSong(songT)
	//console.log(songI.tracks[0])
	//api.player.playTrack(api.Track.fromURI(songI.tracks[0].href));
}	
function lookup(uri) {
	xhr = new XMLHttpRequest()
	xhr.open("GET","http://ws.spotify.com/lookup/1/.json?uri="+encodeURIComponent(uri),false)
	xhr.send()
	return JSON.parse(xhr.response)
}
function doubleCheck(str) {
	str = str.replace("Toby Mac", "TobyMac")
	str = str.replace("18-3","18:3")	
	return str
}
function updateNext() {
	x = new XMLHttpRequest()
	x.open('GET', 'http://christianrock.net/iphonecrdn.asp',false)
	x.send()
	var obj = JSON.parse(x.response)
	s = "<div id='upnext'>Coming Up Next: "
	for (i=0;i< obj.Artists.length-1;i++) {
		s += "<span class='artist'>"+obj.Artists[i]+"</span>, "
	}
	s += "<span class='artist'>"+obj.Artists[obj.Artists.length-1]+"</span></div>"
	$("#next").html(s)
}
function playAlbum() {
	songI = getSong(songT)
	//console.log(songI.tracks[0])
	var song;
	var album;
	try {
		song = songI.tracks[0].href
		album = songI.tracks[0].album.href
		var tmp = songT.split(" - ")
		$("#info").html("<div id='infotext'>Now playing: <span id='song'>"+tmp[1]+"</span> by: <span id='artist'>"+tmp[0]+"</span></div>")
		console.log("test: ",songI)
	} catch (e) {
		song = backups[Math.round(Math.random()*(backups.length-1))];
		album = song
	}		
	var album = api.Album.fromURI(album);
	var image = img.forAlbum(album,{width:300,height:300});
	//document.body.appendChild(image.node);
	$("#nowplaying").html(image.node)
}	
function playSong(isButton) {
	try {
		if (api.player.playing && isButton) {
			api.player.pause()
			console.log("pausing")
			return
		}
		songT = nowPlaying()
		songI = getSong(songT)
		if (songI.tracks[0].href == api.player.track.uri && isButton) {
			api.player.play()
			console.log("playing")
			return
		}
	} catch(e) {
		console.log(e)
		songT = nowPlaying()
		songI = getSong(songT)
	}
	console.log(songT)
	//console.log(songI.tracks[0])
	var song;
	var album;
	try {
		song = songI.tracks[0].href
		album = songI.tracks[0].album.href
		var tmp = songT.split(" - ")
		$("#info").html("<div id='infotext'>Now playing: <span id='song'>"+tmp[1]+"</span> by: <span id='artist'>"+tmp[0]+"</span></div>")
		console.log("test: ",songI)
		api.player.playTrack(api.Track.fromURI(song));
		lu = lookup(song)
	} catch (e) {
		console.log(api.player)
		song = backups[Math.round(Math.random()*(backups.length-1))];
		api.player.playTrack(api.Track.fromURI(song));
		lu = lookup(song)
		album = lu.track.album.href
		$("#info").html("<div id='infotext'>Unfortunately, Spotify is unable to play the song: <span id='oldsong'>"+songT.split(" - ")[1]+"</span>. Hopefully, you will enjoy <span id='song'>"+lu.track.name+"</span> by <span id='artist'>"+lu.track.artists[0].name+"</span></div>")  
	}		

	var album = api.Album.fromURI(album);
	var image = img.forAlbum(album,{width:300,height:300});
	//document.body.appendChild(image.node);
	$("#nowplaying").html(image.node)
	var tmp = api.Artist.fromURI(lu.track.artists[0].href).load('biography').done(function(old) {
		ab = old
		console.log(old.biography)
		if (old.biography) {
			$("#morefo").html("<div id='bio'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp"+old.biography+"</div>")
		} else {
			$("#morefo").html("<div id='nobio'>No info on "+songT.split(' - ')[0]+"</div>")
		}
	})
	updateNext()
}	
require(['$api/models', '$views/image#Image', '$views/list#List'], function(models, Image,List) {
	$("#playsong").click(function() {
		playSong(true)
	})
	api = models
	img = Image
	list = List
	models.player.addEventListener('change:track', function(arg) {
		console.log(arg);

		//if (arg.data.track==null || (arg.data.position==0 && !arg.data.isPlaying)) {
		if (songI.tracks[0].href == arg.oldValue.uri) {
			console.log('here')
			playSong(false)
			//console.log(arg)
		} else {
			console.log("HUH")
		}
		console.log(arg)
		//console.log(arg.target.position, arg.target.duration) 
	
	});
	playSong(false)

});
/**$(document).load(function() {
	console.log('loaded')
	$("#playsong").click(function() {init()})
})**/
