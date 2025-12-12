import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "https://945346be86a0.ngrok-free.app/ws-exchange";
const TOPIC = "/topic/history-update";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.listeners = [];
    this.isConnected = false;
  }

  connect() {
    // Create STOMP client
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: () => {}, // Disable debug logs
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // On connect
    this.stompClient.onConnect = (frame) => {
      console.log("WebSocket connected:", frame);
      this.isConnected = true;

      // Subscribe to topic
      this.stompClient.subscribe(TOPIC, (message) => {
        const data = JSON.parse(message.body);
        console.log("Received new rate:", data);

        // Notify all listeners
        this.listeners.forEach((callback) => callback(data));
      });
    };

    // On error
    this.stompClient.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      this.isConnected = false;
    };

    // On disconnect
    this.stompClient.onWebSocketClose = () => {
      console.log("WebSocket disconnected");
      this.isConnected = false;
    };

    // Activate connection
    this.stompClient.activate();
  }

  // Add listener for new records
  onNewRecord(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.isConnected = false;
    }
  }
}

const socketService = new WebSocketService();
socketService.connect();

export default socketService;
