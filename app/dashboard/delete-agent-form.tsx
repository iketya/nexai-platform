"use client";

import { deleteAgent } from "./actions";

export default function DeleteAgentForm({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteAgent}
      className="ml-auto"
      onSubmit={(event) => {
        if (!window.confirm(`「${name}」を削除しますか？\n会話履歴も削除され、元に戻せません。`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="rounded-xl px-3 py-2 text-sm font-bold text-rose-300 hover:bg-rose-400/10">削除</button>
    </form>
  );
}
