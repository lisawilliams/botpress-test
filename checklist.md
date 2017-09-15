# Bot Startup & Deployment Checklist

## To start localhost version of bot:

At the command line: `cd botpress-test/testbot/`

Once inside the `testbot` folder, run `bp start`. You will get the following error or something like it:

```
Error: An error has been returned by Facebook API.
Status: 400 (Bad Request)
(# 2200) Callback verification failed with the following errors: HTTP Status Code = 404; HTTP Message = Not Found
```
That's okay because you have not started *ngrok* yet. Ngrok is a local webserver that allows incoming connections; it gets the messages from the Facebook API.

## Start ngrok

* Open a new tab in Terminal.
* `cd /wdi/tools/` (or wherever you installed ngrok)
* type `ls -as` to be sure ngrok is present. ngrok looks like a folder but it isn't. Don't try to `cd` into it.
* At the command line, type `./ngrok http 3000` You will see an ngrok console that looks like this:
* Note the url next to 'Forwarding.' Copy this.
* Visit `http://localhost:3000/modules/botpress-messenger` in your web browser.
* If you have previously connected your FB bot to a local ngrok server, you will need to press "Disconnect" in the upper right.
* Where it says "Hostname," paste in your ngrok URL. Hit Save. Make sure that you do not include "https" in the box where you paste your URL; that's included by botpress.
* Visit your FB page for the bot (https://www.facebook.com/BotTest-360294524404976/).
* Hover over the "Send a message" button and click "Test button" on the menu that pops up.
* If there is a previous conversation, click the gear icon on the chat window and delete the conversation. You should see a link at the bottom of the chat window that says "Get Started." Click that link.
* Your bot should run. If it doesn't, go through the above checklist -- including the localhost part! slowly and carefully.

## Deploy to Heroku
