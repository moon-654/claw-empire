import type { UiLanguage } from "../i18n";
import { pickLang } from "../i18n";
import MessageContent from "./MessageContent";
import type { DecisionInboxItem } from "./chat/decision-inbox";

interface DecisionInboxModalProps {
  open: boolean;
  loading: boolean;
  items: DecisionInboxItem[];
  busyKey: string | null;
  uiLanguage: UiLanguage;
  onClose: () => void;
  onRefresh: () => void;
  onReplyOption: (item: DecisionInboxItem, optionNumber: number) => void;
  onOpenChat: (agentId: string) => void;
}

function formatTime(ts: number, locale: UiLanguage): string {
  return new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export default function DecisionInboxModal({
  open,
  loading,
  items,
  busyKey,
  uiLanguage,
  onClose,
  onRefresh,
  onReplyOption,
  onOpenChat,
}: DecisionInboxModalProps) {
  if (!open) return null;

  const t = (text: { ko: string; en: string; ja?: string; zh?: string }) => pickLang(uiLanguage, text);
  const isKorean = uiLanguage.startsWith("ko");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 w-full max-w-3xl rounded-2xl border border-indigo-500/30 bg-slate-900 shadow-2xl shadow-indigo-500/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧭</span>
            <h2 className="text-lg font-bold text-white">
              {t({ ko: "미결 의사결정", en: "Pending Decisions", ja: "未決の意思決定", zh: "待处理决策" })}
            </h2>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {t({ ko: "새로고침", en: "Refresh", ja: "更新", zh: "刷新" })}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {t({ ko: "미결 목록 불러오는 중...", en: "Loading pending decisions...", ja: "未決一覧を読み込み中...", zh: "正在加载待处理决策..." })}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {t({ ko: "현재 미결 의사결정이 없습니다.", en: "No pending decisions right now.", ja: "現在、未決の意思決定はありません。", zh: "当前没有待处理决策。" })}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {isKorean ? item.agentNameKo : item.agentName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatTime(item.createdAt, uiLanguage)}
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenChat(item.agentId)}
                      className="rounded-md border border-slate-600 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      {t({ ko: "채팅 열기", en: "Open Chat", ja: "チャットを開く", zh: "打开聊天" })}
                    </button>
                  </div>

                  <div className="decision-inbox-request rounded-lg border border-slate-700/70 bg-slate-900/60 px-2.5 py-2 text-xs text-slate-200">
                    <MessageContent content={item.requestContent} />
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {item.options.map((option) => {
                      const key = `${item.id}:${option.number}`;
                      const isBusy = busyKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onReplyOption(item, option.number)}
                          disabled={isBusy}
                          className="decision-inbox-option w-full rounded-md border border-indigo-500/35 bg-indigo-500/15 px-2.5 py-1.5 text-left text-xs text-indigo-100 transition hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy
                            ? t({ ko: "전송 중...", en: "Sending...", ja: "送信中...", zh: "发送中..." })
                            : `${option.number}. ${option.label}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
