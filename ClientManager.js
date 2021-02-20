//ClientManager.js

const net = require('net');

class ClientManager {
    constructor(args) {
        /** @type {net.Socket[]}*/
        this.clients = [];
    }

    /**
     * Create new client socket and add to clients collection.
     * @param {net.Socket} socket - The socket of the connected client.
     */
    addNewConnection(socket) {
        socket
            .on('data', this.handleData)
            .on('error', (err) => {
                console.log("Socket Error:", err.message);
            })
            .on('close', (had_error) => {
                if (had_error) {

                } else {
                    let i = this.clients.indexOf(socket);
                    console.log(this.clients[i].remoteAddress, "disconnected.");
                    this.clients.splice(i, 1);
                }
            });
        socket.setEncoding('utf8');
        socket.clientID = this.clients.length;
        this.clients.push(socket);
    }

    /**
     * Callback function for data event of client {@link net.Socket} socket.
     * */
    handleData(data) {
        if (data === "0") { //Get ClientID command
            console.log("ClientID:",this.clientID);
            this.write(this.clientID.toString());
        }
        else {
            this.write(data);
        }
        console.log("Sent to Client #" + this.clientID, data.toString());        
    }

    
    closeAllConnections() {
        for (const s of this.clients) {
            s.end((err) => { if(err) console.log(err.message) });
        }
    }
}

module.exports = ClientManager;