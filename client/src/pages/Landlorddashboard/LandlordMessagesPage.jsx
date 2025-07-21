import React, { useEffect, useState } from "react";
import API from '../../../api'
import { MessageSquare, SendHorizonal } from "lucide-react";

const LandlordMessagesPage = () => {
  const [user, setuser] = useState("")
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await API.get(`/api/messages/threads/landlord/${user._id}`);
        setThreads(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchThreads();
  }, [user]);

  const loadMessages = async (threadId) => {
    try {
      const res = await API.get(`/api/messages/thread/${threadId}`);
      setMessages(res.data.messages);
      setActiveThread(res.data.threadId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await API.post("/api/messages/send", {
        threadId: activeThread,
        senderId: user._id,
        message: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">Messages</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left panel - Threads */}
        <div className="md:col-span-1 border rounded-xl p-3 bg-gray-50">
          <h3 className="font-semibold mb-2 text-green-600">Conversations</h3>
          <ul>
            {threads.map((thread) => (
              <li
                key={thread._id}
                className={`p-2 cursor-pointer rounded-lg hover:bg-green-100 ${
                  activeThread === thread._id ? "bg-green-100" : ""
                }`}
                onClick={() => loadMessages(thread._id)}
              >
                <span className="text-sm font-medium text-gray-800">
                  With: {thread.participants.filter((id) => id !== user._id)[0]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel - Chat */}
        <div className="md:col-span-2 border rounded-xl p-3 bg-white shadow-sm">
          {activeThread ? (
            <>
              <div className="h-80 overflow-y-auto mb-3 border p-3 rounded-md bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 flex ${
                      msg.senderId === user._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className={`px-3 py-2 rounded-xl text-sm ${
                        msg.senderId === user._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.message}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleSend}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
                >
                  <SendHorizonal size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 flex flex-col items-center justify-center h-80">
              <MessageSquare size={36} className="mb-2 text-blue-500" />
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordMessagesPage;
