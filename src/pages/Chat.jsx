
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaSearch,
  FaEllipsisV,
  FaPaperPlane,
  FaRobot,
  FaCheckDouble,
  FaArrowLeft,
  FaComments,
  FaSyncAlt,
} from "react-icons/fa";

import API_URL from "../config/api";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("foodshare_user") || "null");
  } catch {
    return null;
  }
}

function getToken() {
  return (
    localStorage.getItem("foodshare_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "U"
  );
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatContactTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toDateString() === new Date().toDateString()
    ? formatTime(value)
    : date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
      });
}

export default function Chat() {
  const user = getStoredUser();
  const currentUserId = Number(user?.id);

  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [messagesError, setMessagesError] = useState("");
  const [sendError, setSendError] = useState("");

 const inputRef = useRef(null);
const messagesContainerRef = useRef(null);
const endRef = useRef(null);
const selectedRef = useRef(null);
  const busyRef = useRef(false);
  const sequenceRef = useRef(0);

  useEffect(() => {
    selectedRef.current = selectedUser;
  }, [selectedUser]);

  const headers = useCallback(
    () => ({
      Authorization: `Bearer ${getToken()}`,
    }),
    []
  );

  const loadContacts = useCallback(async () => {
    if (!getToken()) {
      setContactsError("Please log in again to use chat.");
      setContactsLoading(false);
      return;
    }

    setContactsLoading(true);
    setContactsError("");

    try {
      const response = await fetch(`${API_URL}/chat/contacts`, {
        headers: headers(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not load contacts.");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.contacts)
          ? data.contacts
          : [];

      setContacts(list);

      setSelectedUser((previous) => {
        if (!previous) return list[0] || null;

        return (
          list.find(
            (contact) => Number(contact.id) === Number(previous.id)
          ) || null
        );
      });
    } catch (error) {
      setContactsError(error.message || "Could not load contacts.");
    } finally {
      setContactsLoading(false);
    }
  }, [headers]);

  const loadMessages = useCallback(
    async (contactId, silent = false) => {
      if (!contactId || !getToken() || busyRef.current) return;

      busyRef.current = true;
      const sequence = ++sequenceRef.current;

      if (!silent) {
        setMessagesLoading(true);
        setMessagesError("");
      }

      try {
        const response = await fetch(
          `${API_URL}/chat/${contactId}/messages`,
          { headers: headers() }
        );

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(data.message || "Could not load messages.");
        }

        if (
          sequence !== sequenceRef.current ||
          Number(selectedRef.current?.id) !== Number(contactId)
        ) {
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected messages response from the server.");
        }

        setMessages(data);
        setMessagesError("");
      } catch (error) {
        if (!silent && sequence === sequenceRef.current) {
          setMessagesError(error.message || "Could not load messages.");
        }
      } finally {
        busyRef.current = false;

        if (!silent && sequence === sequenceRef.current) {
          setMessagesLoading(false);
        }
      }
    },
    [headers]
  );

  useEffect(() => {
    loadContacts();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadContacts();
      }
    }, 20000);

    return () => window.clearInterval(timer);
  }, [loadContacts]);

  useEffect(() => {
    if (!selectedUser?.id) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    const id = selectedUser.id;

    sequenceRef.current++;
    busyRef.current = false;

    setMessages([]);
    setMessagesError("");
    setMessagesLoading(true);

    loadMessages(id);

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadMessages(id, true);
      }
    }, 4000);

    return () => {
      window.clearInterval(timer);
      sequenceRef.current++;
      busyRef.current = false;
    };
  }, [selectedUser?.id, loadMessages]);

 useEffect(() => {
  const container = messagesContainerRef.current;

  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}, [messages, selectedUser?.id]);

  const chooseContact = (contact) => {
    sequenceRef.current++;
    busyRef.current = false;

    selectedRef.current = contact;
    setSelectedUser(contact);
    setMessages([]);
    setMessagesError("");
    setSendError("");
    setMobileChat(true);
    setShowAI(false);
    setShowMenu(false);
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = newMessage.trim();
    const contact = selectedUser;

    if (!text || !contact || sending) return;

    if (!getToken()) {
      setSendError("Please log in again.");
      return;
    }

    setSending(true);
    setSendError("");

    try {
      const response = await fetch(
        `${API_URL}/chat/${contact.id}/messages`,
        {
          method: "POST",
          headers: {
            ...headers(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Message could not be sent.");
      }

      if (data?.id == null || !data.message) {
        throw new Error(
          "The server did not confirm the saved message."
        );
      }

      if (Number(selectedRef.current?.id) === Number(contact.id)) {
        setMessages((previous) => {
          if (
            previous.some(
              (message) => String(message.id) === String(data.id)
            )
          ) {
            return previous;
          }

          return [...previous, data];
        });
      }

      setContacts((previous) =>
        previous.map((item) =>
          Number(item.id) === Number(contact.id)
            ? {
                ...item,
                lastMessage: data.message,
                lastMessageAt:
                  data.created_at || new Date().toISOString(),
              }
            : item
        )
      );

      setNewMessage("");
    } catch (error) {
      setSendError(error.message || "Message could not be sent.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    (contact.name || "")
      .toLowerCase()
      .includes(searchText.trim().toLowerCase())
  );

  const suggestions = [
    "Hello! How can I help you?",
    "Thank you for contacting FoodShare.",
    "Could you please share more details?",
    "When would you like to arrange the pickup?",
  ];

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white">
      {/* Fixed page header */}
      <header className="relative z-30 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-4 text-gray-900 sm:px-6">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            FoodShare Chat
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Connect with the FoodShare community
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-gray-700 sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>Private conversations</span>
        </div>
      </header>

      {/* Contacts and chat fill the remaining height */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">

        {/* Contacts panel */}
        <aside
          className={`${
            mobileChat ? "hidden sm:flex" : "flex"
          } min-h-0 min-w-0 w-full shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-[#edf4f0] sm:w-[300px] lg:w-[340px]`}
        >
          <div className="shrink-0 border-b border-gray-200 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800">Chats</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {contacts.length} contacts
                </p>
              </div>

              <button
                type="button"
                onClick={loadContacts}
                title="Refresh contacts"
                className="rounded-lg p-2 text-[#064B3A] hover:bg-green-100"
              >
                <FaSyncAlt />
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:border-green-600">
              <FaSearch className="shrink-0 text-gray-400" />

              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search conversations..."
                aria-label="Search conversations"
                className="w-full min-w-0 bg-transparent text-sm text-gray-800 outline-none"
              />
            </div>
          </div>

          {/* Contacts scroll independently */}
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {contactsLoading ? (
              <p className="p-5 text-center text-sm text-gray-500">
                Loading contacts...
              </p>
            ) : contactsError ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-600">
                  {contactsError}
                </p>

                <button
                  type="button"
                  onClick={loadContacts}
                  className="mt-3 rounded-lg bg-[#064B3A] px-4 py-2 text-sm text-white"
                >
                  Try again
                </button>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center">
                <FaComments className="mx-auto mb-3 text-3xl text-green-700" />

                <p className="font-semibold text-gray-700">
                  {searchText ? "No matching contacts" : "No contacts yet"}
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {searchText
                    ? "Try another name."
                    : "Registered users returned by your chat API will appear here."}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const active =
                  Number(selectedUser?.id) === Number(contact.id);

                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => chooseContact(contact)}
                    className={`flex w-full items-center gap-3 border-b border-gray-100 px-3 py-4 text-left transition ${
                      active ? "bg-green-100" : "hover:bg-white"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#087b59] font-bold text-white">
                      {getInitials(contact.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {contact.name || "FoodShare member"}
                        </p>

                        <span className="shrink-0 text-[10px] text-gray-400">
                          {formatContactTime(contact.lastMessageAt)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs capitalize text-green-700">
                        {contact.role || "FoodShare member"}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {contact.lastMessage || "Start a conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat panel */}
        <section
          className={`${
            mobileChat ? "flex" : "hidden sm:flex"
          } min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#edf4f0]`}
        >
          {selectedUser ? (
            <>
              {/* Selected contact header stays fixed */}
              <div className="relative z-20 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileChat(false)}
                    aria-label="Back to contacts"
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
                  >
                    <FaArrowLeft />
                  </button>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#087b59] font-bold text-white">
                    {getInitials(selectedUser.name)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-800">
                      {selectedUser.name || "FoodShare member"}
                    </h2>

                    <p className="mt-1 text-xs capitalize text-gray-500">
                      {selectedUser.role || "FoodShare member"}
                    </p>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowMenu((value) => !value)}
                    aria-label="Chat options"
                    className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100"
                  >
                    <FaEllipsisV />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-11 z-40 w-44 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          loadMessages(selectedUser.id);
                          setShowMenu(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Refresh messages
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAI((value) => !value);
                          setShowMenu(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50"
                      >
                        Message suggestions
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ONLY this message area scrolls */}
              <div
  ref={messagesContainerRef}
  className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 py-5 sm:px-6"
>
                {messagesLoading && messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Loading messages...
                  </p>
                ) : messagesError ? (
                  <div className="mx-auto my-auto w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-sm">
                    <p className="text-sm text-red-600">
                      {messagesError}
                    </p>

                    <button
                      type="button"
                      onClick={() => loadMessages(selectedUser.id)}
                      className="mt-3 rounded-lg bg-[#064B3A] px-4 py-2 text-sm text-white"
                    >
                      Retry
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-[#087b59] shadow-sm">
                      <FaComments />
                    </div>

                    <h3 className="font-semibold text-gray-700">
                      Start a conversation
                    </h3>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                      Send a message to {selectedUser.name} to get started.
                    </p>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-end gap-4">
                    {messages.map((message) => {
                      const mine =
                        Number(message.sender_id) === currentUserId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            mine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                              mine
                                ? "rounded-br-sm bg-[#087b59] text-white"
                                : "rounded-bl-sm border border-white bg-white text-gray-800"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {message.message}
                            </p>

                            <div
                              className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                                mine ? "text-green-100" : "text-gray-400"
                              }`}
                            >
                              <span>
                                {formatTime(message.created_at)}
                              </span>

                              {mine && <FaCheckDouble />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={endRef} />
                  </div>
                )}
              </div>

              {/* AI suggestions */}
              {showAI && (
                <div className="shrink-0 border-t border-green-100 bg-green-50 px-3 py-3 sm:px-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#064B3A]">
                    <FaRobot />
                    Message suggestions
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => {
                          setNewMessage(suggestion);
                          setShowAI(false);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-green-200 bg-white px-3 py-2 text-xs text-[#064B3A] hover:bg-green-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sendError && (
                <p className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
                  {sendError}
                </p>
              )}

              {/* Message input stays at the bottom */}
              <form
                onSubmit={sendMessage}
                className="relative z-20 shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4"
              >
                <div className="flex items-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    title="Message suggestions"
                    onClick={() => setShowAI((value) => !value)}
                    className="mb-1 rounded-xl p-2.5 text-[#064B3A] hover:bg-green-50"
                  >
                    <FaRobot size={18} />
                  </button>

                  <div className="flex min-w-0 flex-1 items-end rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-600 focus-within:bg-white">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={newMessage}
                      onChange={(event) => {
                        setNewMessage(event.target.value);

                        if (sendError) {
                          setSendError("");
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      aria-label="Type a message"
                      maxLength={5000}
                      className="max-h-28 min-h-7 w-full resize-y bg-transparent py-1 text-sm text-gray-800 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    aria-label="Send message"
                    className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#064B3A] text-white hover:bg-[#087b59] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <FaSyncAlt className="animate-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </div>

                <p className="mt-2 pl-1 text-[10px] text-gray-400">
                  Enter to send · Shift + Enter for a new line
                </p>
              </form>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center">
              <FaComments className="mb-4 text-5xl text-[#087b59]" />

              <h2 className="text-xl font-bold text-gray-800">
                Welcome to FoodShare Chat
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Select a contact to start a private conversation.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

