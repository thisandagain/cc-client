## cc-client
#### Node.js wrapper for the Constant Contact API

### Basic Use
```javascript
var client = require('cc-client')('APIKEY', 'USERNAME', 'PASSWORD');

// Get all contacts
client.all(function (err, obj) {
    console.dir(obj);
});

// Get one contact by id
client.one('1', function (err, obj) {
    console.dir(obj);
});

// Search for a contact by email address
client.search('kitty@catworld.com', function (err, obj) {
    console.dir(obj);
});

// Create a new contact with the source type of "ACTION_BY_CUSTOMER" and add it to list 1
client.create('nyan@cat.com', 'ACTION_BY_CUSTOMER', 1, function (err, obj) {
    console.dir(obj);
});
```

### To Test
```bash
node test/index.js --apikey APIKEY --user USERNAME --pass PASSWORD
```