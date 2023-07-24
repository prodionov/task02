## Quick start:
Download and install nodejs 16.14.x @ http://nodejs.org/download/

```cd whiteSwanData\```\
Install dependencies: 
```npm install```

In the root folder create .enf file and add:
```javascript
    SECRET_KEY = <your secret key>
```

Run tests: ```npm test```\
Local development: ```npm run local```

<p>The process of authorization is as simple as possible.
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
The project is build for skybet and event url has the following format: "https://m.skybet.com/horse-racing/funabashi/event/31913732"

**Request**
Curl example:
```javascript
    curl -H 'Content-Type: application/json' \ 
        -H "Authorization: Bearer <insert your token>" \
        -d '{"url": "https://m.skybet.com/horse-racing/newbury/event/31896647"}' \
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






