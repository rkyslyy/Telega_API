# Endcrypt

Easy end-to-end encryption in Node. This module uses the Diffie-Hellman protocol to exchange secrets between two parties. An AES256 encryption key is derived from the exchange and used to encrypt messages in CBC mode. This module uses cryptographically secure Pseudo-RNG to create private keys on the fly. A 2048-bit base prime is used in the Diffie-Hellman parameter calculation.

*"Endcrypt rules because it's easy to use, small in size and has no additional dependecies!"
-Anonymous*

## Installation

Install using the node package manager `npm` by issuing

```
npm install endcrypt
```

Then import in your project

```
// CommonJS import syntax
var endcrypt = require("endcrypt")
new endcrypt.Endcrypt()

// ES6 import syntax
import { Endcrypt } from "endcrypt"
new Endcrypt()
```

## Usage

Using the module is very simple: first you initialize the `Endcrypt` objects, exchange keys and then call the encrypt and decrypt methods.

**Basic example:**

```
// Let two parties initialize endcrypt
var alice = new Endcrypt();
var bob = new Endcrypt();

// OPTIONAL: Initialization calls `createKeys()` automatically, so you
// will already have private and public keys. To regenerate you
// can call
alice.createKeys();

// Exchange public keys via callback function; this could
// be an ajax call or socket.send() or whatever you want
alice.sendHandshake(function(publicKeyString) {
  bob.receiveHandshake(publicKeyString)
});
bob.sendHandshake(function(publicKeyString) {
  alice.receiveHandshake(publicKeyString)
});

// OPTIONAL: If the sendHandshake operation is going to be asynchronous
// you can use the waitForHandshake() method to trigger success
// or fail callbacks
alice.waitForHandshake(
  function(){
    console.log("Handshake success!");
  },
  function(){
    console.log("Timeout occured!");
  },
  // 10-second timeout
  10000);

// When a handshake is complete, both parties will have a common
// AES encryption key
var encrypted = alice.encrypt("Hello Bob!");
var plain = bob.decrypt(encrypted);

console.log(plain) // Will log "Hello Bob!"

// Use clear handshake when done with all communication
alice.clearHandshake();
bob.clearHandshake();
```
Described above is the basic scheme to setup end-to-end encryption. But you can easily create custom schemes yourself using the functions provided (see below).

**Simple AES encrypt/decrypt example**

```
// Initialize the Endcrypt object
var e = new Endcrypt();

// Our message to be encrypted
var plain = "Hello world!";

// Encrypt it (IV is auto-generated)
var encrypted = e.encryptWithKey(plain, "16bytesecretkeys")

// Log it
console.log(encrypted)

// The output will be similar to
// {e: "U2FsdGVkX1/LaoLKb6vyoupV5zTzewZCXTPTJSLgwkQ=", iv: "D83V07m3n07G1W0N"}

// The encrypted message is in .e and the initialization vector in .iv

encrypted.e
encrypted.iv

// Now decrypt it using the same key
var decrypted = e.decryptWithKey(encrypted, "16bytesecretkeys");

// Log it
console.log(decrypted)

// The output will be plain string
// "Hello world!"

```

## Randomness

When running in a modern web browser the module will use a cryptographically secure `RandomSource.getRandomBytes` for key generation. A fallback to Mersenne-Twister is provided for older browsers.

## Encryption keys

The `Endcrypt` object stores your encryption keys. The object holds the following keys under normal operation:

```
privateKey              // Private key in bigInt raw format
privateKeyString        // Private key in string format
publicKey               // Public key in bigInt raw format
publicKeyString         // Public key string in Base64 format
foreignPublicKey        // Trusted party public key in bigInt raw format
foreignPublicKeyString  // Trusted party public key Base64 format
encryptionKey           // AES encryption key after successful handshake in string format
```

## Method summary

A couple of helpful methods provided by the `Endcrypt` object can be used to create custom behavior:

**encryptWithKey(message, key)**  
Used to encrypt a plaintext message string with key. Key length must be a multiple of 16 bytes. IV is created on the fly. Outputs a message object in format

```
{e: <encrypted base64 string>, iv: <initialization vector string>}
```

**decryptWithKey(encrypted, key)**  
Decrypts an encrypted message object (see above).

**aesEncrypt(message, key, iv)**
Similar to `encryptWithKey` but lets you specify custom iv.

**aesDecrypt(message, key, iv)**  
Similar to `decryptWithKey` but lets you specify custom iv and expects message in string format (Base64).

**createIV()**  
Creates a random 16-byte initialization vector

**createRandomIntStr(complexity)**  
Create a cryptographically secure random integer string of a certain complexity.

**sendHandshake(callback)**  
Passes `publicKeyString` to callback and calls it.

**receiveHandshake(publicKeyString)**  
Calculates bigInt `foreignPublicKey` from `publicKeyString` and derives an AES encryption key. The encryption key is accessible through `encryptionKey` and both `encrypt` and `decrypt` methods will work after that.

**clearHandshake()**  
Destroys foreign keys and encryption keys and prepares the object for a new handshake.

**clearEncryptionKey()**  
Destroy encryption key. WARN: Not totally secure, clear browser cache as well.

**clearForeignKeys()**  
Destroys foreign public key obtained via handshake.
