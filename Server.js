//server.js
'use strict';

const net = require('net');
const readline = require('readline');

const ClientManager = require("./ClientManager");

/**
 * This class handles listening for new client connections and handles the passing of data to and from connected clients.
 */
class Server {
    constructor(args) {

        console.log("======================\n  Socket Test Server\n======================");

        this.addr = "127.0.0.1";
        this.port = 4242;
        
        this.clientManager = new ClientManager();

        //create listen socket server on {addr}, {port}
        this.server = net.createServer((socket) => {
            this.clientManager.addNewConnection(socket);
            console.log("New client connected.", socket.remoteAddress, socket.remotePort);
        }).on('error', (err) => {
            switch (err.code) {
                case 'ECONNRESET':
                    console.log("Error: Connection remotely reset.");
                    break;
                default:
                    console.log("Error:", err.message);
            }
        }).listen(this.port, this.addr, () => {
            console.log("Listening on:", this.server.address().address, "Port:", this.server.address().port);  
        });
    }
    /**
     * Disconnects all connected clients, shutdowns listen server, and closes readline interface if not already closed. 
     * */
    shutdown() {
        console.log("Shutting Down...")

        //close client connections
        this.clientManager.closeAllConnections();
        this.server.close((err) => {
            if (typeof err !== 'undefined') console.log(err.message);          
        });   
    }
}

module.exports = Server;

function main() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
        removeHistoryDuplicates: true,
        prompt: '>'
    });

    console.clear();

    let server = new Server();

    rl.prompt();

    //readline line handler
    rl.on('line', (line) => {
        switch (line.trim()) {
            case '/exit':
                server.shutdown();
                rl.close();
                break;
            case '/info':
                console.log("Number of clients connected:", server.clientManager.clients.length);
                break;
            default:
                rl.prompt();
        }
    });

    //readline close handler
    rl.on('close', () => {
       //rl.removeAllListeners();
    })
}

if (require.main === module) {
    main();
}