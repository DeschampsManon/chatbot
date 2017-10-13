const restify = require('restify');
const botbuilder = require('botbuilder');

// Setup restify server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
    console.log('%s bot started at %s', server.name, server.url);
});

// Create chat connector
const connector = new botbuilder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});

// Listening for user input
server.post('/api/messages', connector.listen());

// Reply by echoing
var alarmMenu = {
    "create alarme" : {
        "choice": "create"
    },
    "show active alarms" : {
        "choice": "showActive"
    },
    "show all alarms": {
        "choice": "showAll"
    }
}

var bot = new botbuilder.UniversalBot(connector, [
    function(session) {
        // call dialog alarmMenu
        session.beginDialog('alarmMenu');
    }
]);

var alarms = [];
var message;

bot.dialog('alarmMenu', [
    function(session) {
        // ask if user want to create alarm, show active alarms or show all alarms 
        botbuilder.Prompts.choice(session, 'Que voulez vous faire ?', alarmMenu);    
    },
    function(session, results) {
        // ask dialog choosed by user
        session.beginDialog(alarmMenu[results.response.entity].choice);
    } 
]);

bot.dialog('create', [
    function(session, args, next) {
        session.dialogData.alarm = args || {};
        if(!session.dialogData.alarm.name) {
            // ask alarm name
            botbuilder.Prompts.text(session, "What's your alarm name ?");
        }else{
            next();
        }     
    },
    function(session, results, next) {
        if(results.response) {
            session.dialogData.alarm.name = results.response;
        }

        if(!session.dialogData.alarm.date) {
            // ask alarm date 
            botbuilder.Prompts.time(session, "For when I have to schedule this alarm ?");            
        }else{
            next();
        }
    },
    function(session, results, next) {
        if(results.response) {
            session.dialogData.alarm.date = botbuilder.EntityRecognizer.resolveTime([results.response]);
        }

        if(!session.dialogData.alarm.active) {
            // ask if alarm is active or not 
            botbuilder.Prompts.confirm(session, "This alarm is active ?");
        }
    },
    function(session, results, next) {
        if(results.response) {
            session.dialogData.alarm.active = results.response;
        }

        // create hash with alarm parmas
        var alarm = {
            "name" : session.dialogData.alarm.name,
            "date" : session.dialogData.alarm.date,
            "is_active" : session.dialogData.alarm.active
        }
        
        if(alarm.name && alarm.date) {
            // if alarm successfully created add this alarm in alarms array
            alarms.push(alarm);
            session.userData.alarms = alarms;
            session.send('Your ' + alarm.name + ' has been sheduled for ' + alarm.date);
            session.beginDialog('alarmMenu');
        }else{
            session.beginDialog('create');
        }
        
    }
])
.cancelAction(
    "cancelAlarm", "Ok", 
    {
        matches: /^stop$/i,
        confirmPrompt: "Are you sure ?"
    }
);



bot.dialog('showAll', [
    function(session) {
        // if alarm exist
        if(session.userData.alarms) {
            message = "This is your alarms : <br>"
            // display alarms list
            for(var alarm of session.userData.alarms) {
                var is_active = (alarm.is_active) ? "Actif" : "Inactif";
                message += "- Name : " + alarm.name + " | Date : " + alarm.date + " | Is active : " + is_active + " <br>";
            }
            session.send(message);    
            session.beginDialog('alarmMenu');
        // if there isn't any alarm
        }else{
            // display message
            message = "There isn't any alarm to display";
            session.send(message);    
            session.beginDialog('alarmMenu');
        }
    }
]);


bot.dialog('showActive', [
    function(session) {
        // if alarm exist
        if(session.userData.alarms) {
            message = "This is your alarms : <br>"
            // display alarms list
            for(var alarm of session.userData.alarms) {
                // if alarm active
                if(alarm.is_active) {
                    // display alarms list
                    message += "- Name : " + alarm.name + " | Date : " + alarm.date + "<br>";
                }
            }
            session.send(message);    
            session.beginDialog('alarmMenu');
        }else{
            // display message
            message = "There isn't any alarm to display";
            session.send(message);    
            session.beginDialog('alarmMenu');
        }
    }
]);
