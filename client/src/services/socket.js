import io from "socket.io-client";

const SOCKET_URL = "";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], 
  autoConnect: true,
});

export default socket;
