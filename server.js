const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connect to MongoDB. The name of the DataBase is: refer-u-chat
mongo.connect('mongodb://127.0.0.1/refer-u-chat', function(err, db){  //db is where we will call queries
    if(err){
        throw err;
    }
    console.log('Connected successfully to MongoDB!');

    // Connecting to socket.io
    client.on('connection', function(socket){
        // The collection is named conversation
        let conversation = db.collectiono('conversations');

        // Function to send the status from the server to thje client
        sendStatus = function(stat){
            //Allways that we pass something from the server to the client we will use .emit
            socket.emit('The status is: ', stat);  
        };

        // GET THE CHATS FROM THE DATABASE
        // Get the last limit(quantity) of chats from refer-u-chat database sorted by Id
        conversation.find().limit(50).sort({_id:1}).toArray(function(err, res){
            if(err) {
                throw err;
            }
            // emit (.emit) the messages
            socket.emit('output', res);
        });

        // HANDLE INPUT EVENTS
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;
            // Check that name and message have content on it (not empty) 
            if(name == "" || message == "") {
                sendStatus("Name and Message are required in order to send a messge");
            } else {
                // Inser message to the database
                //The name comes from the client, see line 34
                conversation.insert({name: name, message: message}, function() {
                    client.emit('output: ', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true  //If we should "clear" the message or not
                    });
                });
            }
        });

        // Handle clear messages with button
        socket.on('clear', function (data) {
            // Remove all chats from "conversation" collection (this is why the {} )
            chat.remove({}, function(){
                // Emit message that all is clear
                socket.emit('Messages cleared');
            })
        });
    });
});
