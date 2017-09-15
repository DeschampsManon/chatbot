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
var bot = new botbuilder.UniversalBot(connector, function(session){
   
    session.send(`Vous avez dit ${session.message.text}`)
    
    bot.on('typing',function(){
        var customMessage = "Ah ouais ?.."
        session.send(customMessage)
    })   
    
    bot.on('endOfConversation',function(){
        var customMessage = "C'est la fin..."
        session.send(customMessage)
    })   

    bot.on('conversationUpdate', function(message) {
        if (message.membersAdded && message.membersAdded.length > 0) {
            var membersAdded = message.membersAdded
            .map(function (x) {
                var isSelf =x.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : x.name) || '' + ' (Id: ' + x.id + ')';
            })
            .join(', ');
            
            customMessage = 'Bienvenue ' + member
        }

        if (message.membersRemoved && message.membersRemoved.length > 0) {
            var membersRemoved = message.membersRemoved
            .map(function (x) {
                var isSelf = x.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : x.name) || '' + ' (Id: ' + x.id + ')';
            })
            .join(', ');

            customMessage = 'L\'utilisateur ' + member + 'a été supprimé'
        }

        if (message.MembersAdded != null && message.MembersAdded.Any()) {
            // foreach (var newMember in update.MembersAdded) {
            //     if (newMember.Id != message.Recipient.Id) {
            //         var reply = message.CreateReply();
            //         reply.Text = $"Welcome {newMember.Name}!";
            //         client.Conversations.ReplyToActivityAsync(reply);
            //     }
            // }
            session.send('a')
        }

        var reply = new builder.Message(session)
            .address(message.address)
            .text(customMessage)
        bot.send(reply);
        
    });

    bot.on('contactRelationUpdate', function(message) {
        if (message.action === 'add') {
            var name = message.user ? message.user.name : null;
            customMessage = 'Coucou %s... Merci de m\'avoir ajouté.'
        } else {
            customMessage = 'Ah.. Bye'
        }

        var reply = new builder.Message()
            .address(message.address)
            .text("", name);
        bot.send(reply);
    });

});