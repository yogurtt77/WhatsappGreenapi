import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Message";

const Chat = ({ idInstance, apiTokenInstance, phone }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [instanceStatus, setInstanceStatus] = useState("");

  useEffect(() => {
    const configureInstance = async () => {
      try {
        await axios.post(
          `https://7103.api.greenapi.com/waInstance${idInstance}/SetSettings/${apiTokenInstance}`,
          {
            webhookUrl: "",
            outgoingWebhook: "yes",
            stateWebhook: "yes",
            incomingWebhook: "yes",
          }
        );

        const statusResponse = await axios.get(
          `https://7103.api.greenapi.com/waInstance${idInstance}/GetStateInstance/${apiTokenInstance}`
        );
        setInstanceStatus(statusResponse.data.stateInstance);
      } catch (error) {
        console.error("Ошибка настройки:", error);
      }
    };

    const clearNotificationQueue = async () => {
      try {
        let response;
        do {
          response = await axios.get(
            `https://7103.api.greenapi.com/waInstance${idInstance}/ReceiveNotification/${apiTokenInstance}`
          );
          if (response.data) {
            await axios.delete(
              `https://7103.api.greenapi.com/waInstance${idInstance}/DeleteNotification/${apiTokenInstance}/${response.data.receiptId}`
            );
          }
        } while (response.data);
      } catch (error) {
        console.log("Очередь очищена");
      }
    };

    if (idInstance && apiTokenInstance) {
      configureInstance();
      clearNotificationQueue();
    }
  }, [idInstance, apiTokenInstance]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `https://7103.api.greenapi.com/waInstance${idInstance}/SendMessage/${apiTokenInstance}`,
        {
          chatId: `${phone}@c.us`,
          message: newMessage,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: response.data.idMessage,
          text: newMessage,
          isOutgoing: true,
          status: "sent",
        },
      ]);

      checkDeliveryStatus(response.data.idMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Ошибка отправки:", error);
    }
  };

  const checkDeliveryStatus = async (messageId) => {
    try {
      const response = await axios.get(
        `https://7103.api.greenapi.com/waInstance${idInstance}/GetMessage/${apiTokenInstance}/${messageId}`
      );
      console.log("Статус доставки:", response.data);
    } catch (error) {
      console.error("Ошибка проверки статуса:", error);
    }
  };

  const fetchMessages = async () => {
    console.log("Начало проверки сообщений:", new Date().toISOString());
    try {
      const response = await axios.get(
        `https://7103.api.greenapi.com/waInstance${idInstance}/ReceiveNotification/${apiTokenInstance}`,
        { params: { receiveTimeout: 20 } }
      );

      console.log("Ответ API:", response.data);

      if (response.data) {
        const { receiptId, body } = response.data;

        await axios.delete(
          `https://7103.api.greenapi.com/waInstance${idInstance}/DeleteNotification/${apiTokenInstance}/${receiptId}`
        );

        if (body.typeWebhook === "incomingMessageReceived") {
          const messageData = body.messageData;
          let messageContent = "";

          switch (messageData.typeMessage) {
            case "textMessage":
              messageContent = messageData.textMessageData.textMessage;
              break;
            case "extendedTextMessage":
            case "quotedMessage":
              messageContent = messageData.extendedTextMessageData.text;
              break;
            default:
              messageContent = "Неподдерживаемый тип сообщения";
          }

          console.log("Получено уведомление от:", body.senderData.sender);
          setMessages((prev) => [
            ...prev,
            {
              id: body.idMessage,
              text: messageContent,
              isOutgoing: false,
              sender: body.senderData.sender,
            },
          ]);
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Ошибка получения:", error);
      }
    }
    console.log("Конец проверки сообщений:", new Date().toISOString());
  };

  useEffect(() => {
    let isMounted = true;

    const checkMessages = async () => {
      if (!isMounted) return;
      await fetchMessages();
      setTimeout(checkMessages, 2000);
    };

    checkMessages();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="chat-container">
      <div className="status-bar">
        Статус инстанса: {instanceStatus || "Проверка..."}
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <Message
            key={`${msg.id}-${index}`}
            text={msg.text}
            isOutgoing={msg.isOutgoing}
            status={msg.status}
          />
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;
