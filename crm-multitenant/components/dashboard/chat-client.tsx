"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type Channel = {
  id: string;
  name: string;
  type: string;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  isAgent: boolean;
  authorName: string;
};

type Insight = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

type ChatClientProps = {
  channels: Channel[];
};

export function ChatClient({ channels }: ChatClientProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(
    channels[0]?.id ?? null,
  );
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channel = useMemo(
    () => channels.find((item) => item.id === selectedChannel) ?? null,
    [channels, selectedChannel],
  );

  const { data, mutate, isLoading } = useSWR<Message[]>(
    selectedChannel ? `/api/chat/messages?channelId=${selectedChannel}` : null,
    {
      revalidateOnFocus: true,
    },
  );

  useEffect(() => {
    setMessage("");
    setInsight(null);
    setError(null);
  }, [selectedChannel]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedChannel || !message.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId: selectedChannel,
          content: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível enviar a mensagem.");
      }

      setMessage("");
      await mutate();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Erro inesperado.");
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateInsight = async () => {
    if (!channel) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focus: `Canal ${channel.name}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível gerar o insight agora.");
      }

      const payload = (await response.json()) as Insight;
      setInsight(payload);
    } catch (insightError) {
      setError(
        insightError instanceof Error
          ? insightError.message
          : "Falha ao gerar insight.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid min-h-[520px] gap-4 md:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase text-slate-500">
          Canais do workspace
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {channels.map((channelItem) => {
            const isActive = channelItem.id === selectedChannel;
            return (
              <li key={channelItem.id}>
                <button
                  type="button"
                  onClick={() => setSelectedChannel(channelItem.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="block font-semibold">{channelItem.name}</span>
                  <span className="text-xs text-slate-500">{channelItem.type}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Canal selecionado
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {channel?.name ?? "Selecione um canal"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => mutate()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              Atualizar
            </button>
            <button
              type="button"
              onClick={handleGenerateInsight}
              disabled={!channel || isGenerating}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Gerando..." : "Insight com IA"}
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
          <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Carregando mensagens...</p>
            ) : data && data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-1 rounded-lg px-3 py-2 ${
                    item.isAgent
                      ? "self-start bg-indigo-600/10 text-indigo-900"
                      : "self-end bg-white text-slate-900 shadow-sm"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-500">
                    {item.isAgent ? "Agente Nova" : item.authorName}
                  </span>
                  <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma mensagem aqui ainda. Inicie uma conversa abaixo.
              </p>
            )}
          </div>

          {insight ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Insight do agente
              </p>
              <h4 className="mt-1 text-sm font-semibold">{insight.title}</h4>
              <p className="mt-2 text-sm">{insight.summary}</p>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <form onSubmit={handleSend} className="flex items-center gap-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
              disabled={!channel}
              placeholder={
                channel
                  ? "Digite sua mensagem ou peça uma análise ao agente..."
                  : "Selecione um canal para conversar."
              }
              className="h-20 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!channel || isSending || !message.trim()}
              className="h-12 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
