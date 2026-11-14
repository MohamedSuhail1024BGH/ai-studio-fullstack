import { useState } from "react";
import "./App.css";

export default function App() {

  const [sender, setSender] = useState("Suhail");
  const [apiKey, setApiKey] = useState("super-secret-dev-key");
  const [model, setModel] = useState("qwen2.5:1.5b");
  const [persona, setPersona] = useState("default");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!prompt.trim() | isStreaming) return;

    const currentPrompt = prompt;
    setPrompt("");
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      {role: "user", content: currentPrompt},
      {role: "assistant", content: ""},
    ]);

    try {

      const response = await fetch("http://localhost:8000/chat_with_ai", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          sender,
          prompt: currentPrompt,
          model,
          persona,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errData.detail}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "error",
          content: err.message,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }

  };

  return (

    <div style={{ maxWidth: "720px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>AI CHAT BUILT WITH REACT</h2>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
         value={sender}
         onChange={(e) => setSender(e.target.value)}
         placeholder="Username (e.g. Suhail)"
        />
        <input type="password" 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="X-API-KEY"
        />
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="qwen2.5:1.5b">qwen2.5:1.5b (Free)</option>
          <option value="llama3">llama3 (Pro)</option>
        </select>
        <select value={persona} onChange={(e) => setPersona(e.target.value)}>
          <option value="default">Helpful Assistant</option>
          <option value="coder">Strict Code Reviewer</option>
          <option value="linux">Linux SysAdmin</option>
          <option value="pirate">Pirate Captain</option>
        </select>
      </div>

      <div style={{ border: "1px solid #444", borderRadius: "8px", padding: "1rem", minHeight: "300px", marginBottom: "1rem" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "0.75rem", color: msg.role === "error" ? "#fff6b6b" : "inherit" }}>
            <strong>{msg.role.toUpperCase()}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          style={{ flex: 1, padding: "0.5rem" }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Anything..."
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming}>
          {isStreaming ? "Streaming...": "Send"}
        </button>
      </form>
    </div>

  );

}

