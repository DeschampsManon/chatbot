var builder = require('botbuilder');

const library = new builder.Library('reservation');

var destinationData = {
    "Bora Bora": {
        name : "Bora Bora"
    },
    "New York": {
        name: "New York"
    },
    "Pool Party": {
        name: "Pool Party"
    }
};

var message;

library.dialog('getUser', [
    function(session, results, next) {
        if(!session.userData.name) {
            builder.Prompts.text(session, "Welcome ! Before start, I need some informations. First, what is your name ?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        session.userData.name = results.response;
        if(!session.userData.name) {
            message = "Thanks, now can have your your email please ?";
        } else {
            message = "Hey " + session.userData.name + " can have I your email please ?";
        }

        if (!session.userData.mail) {
            builder.Prompts.text(session, message);
        } else {
            next();
        }

    },
    function (session, results, next) {
        session.userData.mail = results.response;
        if (!session.userData.age) {
            builder.Prompts.number(session, "For last step I need your age please ?");
        } else {
            next();
        }
    },
    function (session, results) {
        session.userData.age = results.response;
        if (!session.userData.name || !session.userData.mail || !session.userData.age ) {
            session.beginDialog('reservation:getUser');
        } else {
            session.send("Nice to meet you " + session.userData.name);
            session.beginDialog('reservation:hotel');
        }
    }
])
.endConversationAction(
    "endGetUser", "Ok",
    {
        matches: /^cancel$|^goodbye$/i,
        confirmPrompt: "Are you sure ?"
    }
);

library.dialog('hotel', [
    function (session, results) {
        session.send("Now, we can start your reservation");
        builder.Prompts.choice(session, "Where would you like to go : " + session.userData.name + " ?", destinationData);
    },
    function (session, results) {
        session.userData.destination = destinationData[results.response.entity];
        builder.Prompts.time(session, "Good choise ! When you travel start ?");
    },
    function (session, results) {
        session.userData.date = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.number(session, "Ok, how many night ?");
    },
    function (session, results) {
        session.userData.nights = results.response;
        session.endDialogWithResult(results);
        session.send("Votre reservation à " + session.userData.destination.name + " pour " + session.userData.nights + " nuits à partir de " + session.userData.date + " a bien été prise en compte. Un email de confirmation a été envoyé à l'adresse suivante : " + session.userData.mail);
    }
])
.endConversationAction(
    "endOrderHotel", "Ok",
    {
        matches: /^cancel$|^goodbye$/i,
        confirmPrompt: "Are you sure ?"
    }
);

module.exports = library;

