const app = require('express')();
const http = require('http').Server(app);
const port = process.env.PORT || 3000 ;
const express = require('express');
const fs = require('fs');
var roomId;

/* Middlewares	  */

app.use('/static',express.static(__dirname + "/static"))
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

/* server stuff	  */

const server = http.listen(port, () => {
	console.log(`listening on http://localhost:${port}/`);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/static/index.html');
});
app.get('/join', (req, res) => {
	res.sendFile(__dirname + '/static/join.html');
});
app.post('/', (req, res) => {

	var id = req.body.id;
	var name = req.body.name;
	var usrID = req.body.usrID;
	fs.appendFile(`./static/chats/${id}.txt`, "", (err) => {
		if (err) throw err;
	});
	res.status(200);
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({
		x: id,
		y: name,
		z: usrID
	}));
});

app.post('/getOldMessages',(req,res)=>{
	try{
		const id = req.body.id;
		fs.readFile(`./static/chats/${id}.txt`, function(err, data) {
			if(err) throw err;
			var array = data.toString().split("\n");
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify({data:array}));
		})
	}catch(err){
		res.status(400);
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({data:[]}));
	}
})

app.get('/chat', (req, res) => {
	res.sendFile(__dirname + '/static/chat.html');
});

app.get('/help', (req, res) => {
	res.sendFile(__dirname + '/static/help.html');
});


/* socket.io stuff */

const io = require('socket.io')(server)
io.use(async function(socket, next) {
	var handshakeData = socket.request;
	roomId=await handshakeData._query['roomId']
	socket.join(roomId)
	next();
});
io.on('connection',async (socket)=>{
	socket.on('sendMsg',async (id,msg)=>{
		socket.to(id).emit("newMsg",msg);
		saveMsg(id,msg);
	})
})

/* utils  */

const saveMsg = (id,msg) => {
	fs.appendFile(`./static/chats/${id}.txt`, msg + "\n", (err) => {
		if (err) throw err;
	});
}

app.get('/share', (req, res) => {
	res.sendFile(__dirname + '/static/share.html');
});
