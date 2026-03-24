import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.chatbot import PolicyPilotAgent

print("=" * 60)
print("  PolicyPilot — AI Government Scheme Assistant")
print("=" * 60)
print("  Type your message and press Enter.")
print("  Type 'quit' to exit.")
print("  Type 'reset' to start a new conversation.")
print("=" * 60)
print()

USER_ID = "7b8be66f-4dec-41e5-96b0-47a4ef3bb3a5"

agent = PolicyPilotAgent(user_id=USER_ID)

print("Bot: Hello! I am PolicyPilot. I help Indian citizens find "
      "government schemes they qualify for.\n"
      "     Tell me about your situation or ask me anything!")
print()

while True:
    try:
        user_input = input("You: ").strip()
    except (KeyboardInterrupt, EOFError):
        print("\nBot: Goodbye!")
        break

    if not user_input:
        continue

    if user_input.lower() == "quit":
        print("Bot: Goodbye! Hope I was helpful.")
        break

    if user_input.lower() == "reset":
        agent = PolicyPilotAgent(user_id=USER_ID)
        print("Bot: Conversation reset. Hello again! How can I help you?")
        print()
        continue

    reply = agent.chat(user_input)
    print(f"\nBot: {reply}\n")
