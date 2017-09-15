var restify = require('restify');
var botbuilder = require('botbuilder')

// setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
    console.log('%s bot started at %s', server.name, server.url);
});

// create chat connector
var connector = new botbuilder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});

// listening for user inputs
server.post('/api/messages', connector.listen());

// reply by echoing
var sessionAddress, customMessage;

var bot = new botbuilder.UniversalBot(connector, function(session){
    sessionAddress = session.message.address;
    session.send(`Vous avez dit ${session.message.text}`);
});

bot.on('typing', function(){
    customMessage = 'Ah ouais ?..'
    bot.send(new botbuilder.Message()
        .address(sessionAddress)
        .text(customMessage));
});

bot.on('conversationUpdate', function(message){
    savedAddress = message.address;
    
    if (message.membersAdded && message.membersAdded.length > 0) {
        var membersAdded = message.membersAdded
        .map(function (x) {
            var isSelf = x.id === savedAddress.bot.id;
            return (isSelf ? savedAddress.bot.name : x.name + ' (Id: ' + x.id + ')');
        })
        .join(', ');    
        customMessage = 'Bienvenue ' + membersAdded;

        //bot.beginDialog(savedAddress, '/first');
    }

    if (message.membersRemoved && message.membersRemoved.length > 0) {
        var membersRemoved = message.membersRemoved
        .map(function (x) {
            var isSelf = x.id === savedAddress.bot.id;
            return (isSelf ? savedAddress.bot.name : x.name) || '' + ' (Id: ' + x.id + ')';
        })
        .join(', ');

        customMessage = 'L\'utilisateur ' + membersRemoved + ' a été supprimé ou a quitté la conversation'
    }

    bot.send(new botbuilder.Message()
       .address(message.address)
       .text(customMessage));
});

bot.on('contactRelationUpdate', function(message){
    var bot_identity = message.address.bot.name + ' (Id: ' + message.address.bot.id + bot.dialog('/first', [
        (session) => {
            botbuilder.Prompts.text(session, 'Avez-vous une question ?');
        },
        (session, results) => {
            session.send('Je ne suis pas encore assez intélligent pour répondre à cette question :( ');
        }
    ]);')';
    if(message.action && message.action === 'add') {
        customMessage = `Bienvenue ${bot_identity}`;
    }

    if(message.action && message.action === 'remove') {
        customMessage = `Au revoir ${bot_identity}`
    }

    bot.send(new botbuilder.Message()
       .address(message.address)
       .text(customMessage));
});

// bot.dialog('/first', [
//     (session) => {
//         customMessage = 'Comment puis-je vous aider ?';
//         botbuilder.Prompts.text(session, customMessage);
//     }
// ]);