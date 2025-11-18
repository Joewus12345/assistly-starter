import ChatwootWidget from './components/ChatwootWidget';

export default function Page() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1>Assistly Starter</h1>
      <p>
        This is a minimal Next.js app embedding a Chatwoot widget that runs locally in Docker.
        Open the chat launcher at the bottom-right to start a conversation.
      </p>

      <h2 style={{ marginTop: 32 }}>Identify a sample user (optional)</h2>
      <p>
        Click the button below to identify a fake logged-in user to Chatwoot (secure mode if configured).
        You can replace this with your real auth flow later.
      </p>

      <ChatwootWidget />
    </main>
  );
}
