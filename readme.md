## Quick start:
Download and install nodejs 16.14.x @ http://nodejs.org/download/

```cd task02\```\
Install dependencies: 
```npm install```

In the root folder create .enf file and add:
```javascript
    SECRET_KEY = <your secret key>
```

Run tests: ```npm test```\
Local development: ```npm run local```

<p>The authorization process is as simple as possible.
In order to use the endpoint you need to create a user and get a token. That can be done sending a POST request to /createNewUser with the following body:</p>

```javascript
    curl -X POST http://localhost:3000/createNewUser \
        -H 'Content-Type: application/json' \
        -d '{"username": "testUser"}'
```
In response you will receive a token that you can use to access the endpoint /odds.
The token can be added in Postman or in curl request as a header:
-H "Authorization: Bearer <your token>"

## Endpoints:
POST **/odds** Get horse names and odds for the event

The endpoint requires an authorization token in the header and the event url in the request body.
The project is built for skybet and the event url has the following format: "https://m.skybet.com/horse-racing/funabashi/event/31913732"

**Request**
Curl example:
```javascript
    curl -H 'Content-Type: application/json' \
        -H "Authorization: Bearer <insert your token>" \
        -d '{"eventUrl": "https://m.skybet.com/horse-racing/newbury/event/31896647"}' \
        -X POST http://localhost:3000/odds
```

**Response**
```javascript
    Code 200 
    Example Value
    [{
        "horseName": "Priscilla",
        "odds": "5/1",
    }]
```

## Assumptions and considerations:
1. <p> Deeper understanding of the horse racing event 
life-cycle on the website of choice would be beneficial to understand whether we cover all cases. The code is mainly focused on
before the event and right after. Races that are far in the future do not provide odds (SP). No odds are available either around 
the time the race begins (SUSP). The focus should be on the window when they are available</p>

2. <p>For testing purposes, we can't use the event links, as over time they become invalid. Instead, I've used html snapshots
of the event before the race starts and after it ends. There are improvements to be done and considered (implementation on the function side
could be improved, the way the snapshot is stored can be improved), but that allows us
to test and develop fast, they are easy to get and implement. Fewer hits to the real endpoint, easier to use than jest mocks.
One thing to consider is how to detect that the website 
has changed and that the scraping mechanism should be updated accordingly</p>

3. <p>On scalability, there are things to consider: whether we want to hit a particular event frequently and spot that odds were changed.
There are not that many horse racing events taking place simultaneously, so potentially it is the former we are after. It would be 
good to bypass the 'Accept cookies' button (there are suggestions online to use particular headers for that). Then we can scrape 
events in parallel. By and large it depends on business requirements.</p>

4. <p>Things to improve: Error messages currently do not return status codes, more test coverage and load testing.</p>









