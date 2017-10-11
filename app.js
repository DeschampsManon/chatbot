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
var bot = new botbuilder.UniversalBot(connector, [
    function (session, results) {
        if (!session.userData.name || !session.userData.email || !session.userData.age) {
            session.send("Hello");
            return session.beginDialog('reservation:getUser');
        }
    }
]);

bot.library(require('./dialogs/reservation'));
