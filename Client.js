//Client.js
'use strict';

const net = require('net');
const readline = require('readline');

function getMainMenuText() {
    return `Available Commands:
/conn - Attempts to connect to currently configured host and port.
/disc - Disconnects from server.
/exit - Terminates application.
/set  - Sets connection info. Must specify ${ConsoleFlags.FgMagenta}addr${ConsoleFlags.Reset} or ${ConsoleFlags.FgMagenta}port${ConsoleFlags.Reset}
/help - Outputs this menu.
/info - Outputs current connection info.
/quit - Terminates application.`
}

/**
 * ANSI escape codes
 * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code}
 * */
const ConsoleFlags = {
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",

    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
}


class Client {

    constructor() {

        this.addr = '127.0.0.1';
        this.port = 4242;
        console.clear();
        console.log("======================\n  Socket Test Client\n======================")

        console.log('Address:', ConsoleFlags.FgGreen, this.addr, ConsoleFlags.Reset, 'Port:', this.port);
        console.log(getMainMenuText());

        /**@type {net.Socket} */
        this.socket = new net.Socket;
    }

    connect() {

        if (this.socket.pending && !this.socket.connecting) {

            this.socket = net.createConnection(this.port, this.addr, () => {
                this.socket.write("0"); //Get Client ID Command.
            }).on('error', (err) => { //On Error Callback
                switch (err.code) {
                    case "ECONNREFUSED":
                        console.log("Error: Connection Refused to", err.address, err.port);
                        break;
                    case "ECONNRESET":
                        console.log("Error: Connection remotely reset.");
                        delete this.clientID;
                        break;
                    default:
                        console.log(err.message);
                }
            }).on('data', (data) => { //On Data Callback
                if (this.clientID == undefined) {
                    try {
                        this.clientID = parseInt(data);
                        console.log("Assigned ID#" + this.clientID);
                    }
                    catch (error) {
                        console.log("Expected Client ID from server, received", data.toString());
                    }
                } else {
                    console.log('\nFrom server: ' + data.toString());
                }
            }).on('end', () => { //On End callback
                delete this.clientID;
                console.log('Disconnected from server.');
            }).setEncoding('utf8'); //Set Encoding
        } else {
            console.log("Already Connected");
        } 
    }
}

module.exports = Client;

function main() {
    if (process.stdout.isTTY) {

        let client = new Client();

        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '>'
        });

        rl.on('line', (line) => {
            let arr = line.toLowerCase().trim().split(" ");
            let cmd = arr[0];
            let args = arr.slice(1);
            switch (cmd) {
                case "/clear":
                    console.clear();
                    break;
                case "/connect":
                case "/conn":
                case "/c":
                    //connect to server
                    client.connect();
                    break;
                case "/d":
                case "/disc":
                case "/disconnect":
                    client.socket.end();
                    break;
                case "/quit":
                case "/exit":
                    rl.close();
                    return;
                    break;
                case "/help":
                    console.log(getMainMenuText());
                    break;
                case "/info":
                    console.log(client.addr, client.port, "ID#:", (isNaN(client.clientID))?`${ConsoleFlags.FgRed}Not connected${ConsoleFlags.Reset}`:client.clientID);
                    break;
                case "/set":
                    switch (args[0]) {
                        case "port":
                            if (isNaN(args[1])) {
                                console.log("Invalid port number. Please enter a number between 1 and 65535");
                            }
                            else {
                                this.port = args[1];
                                console.log("Set port to", args[1]);
                            }
                            break;
                        case "addr":
                            break;
                        default:
                            console.log("Invalid paramaters. Usage:", ConsoleFlags.Bright, "set port <port>", ConsoleFlags.Reset, "or", ConsoleFlags.Bright, "set addr <ip or uri>.", ConsoleFlags.Reset);
                            break;
                    }
                    break;
                default:
                    if (client.socket.pending) {
                        console.log("Not Connected.");
                    }
                    else {
                        client.socket.write(line);
                    }
                case "":
            }
            /*Display Prompt*/
            rl.prompt();
        }).on('close', () => {
            console.log('Shutting Down...\n');
            if ((typeof client.socket) !== undefined) {
                client.socket.end();
                client.socket.removeAllListeners();
            }
        });

        rl.prompt();

    }
    else {
        console.log("Program must be run from TTY")
    }
}

if (require.main === module) {
    main();
}