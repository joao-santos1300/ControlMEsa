"use client";

import { api } from "@/lib/api";
import type { Table } from "@/lib/types";
import { Badge, Field, Input, useLoad } from "@/components/ui";
import { CrudList, str } from "@/components/CrudList";

export default function GerirMesasPage() {
  const { data, loading, error, reload } = useLoad(() => api<Table[]>("/tables"));

  return (
    <CrudList<Table>
      title="Gerir mesas"
      subtitle="Mesas disponíveis no salão"
      newLabel="Nova mesa"
      items={data}
      loading={loading}
      error={error}
      reload={reload}
      emptyText="Nenhuma mesa cadastrada."
      itemName={(t) => `Mesa ${t.number}`}
      renderItem={(t) => (
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">Mesa {t.number}</p>
          {t.name && <span className="text-sm text-slate-500">{t.name}</span>}
          <Badge tone={t.status === "OCCUPIED" ? "amber" : "green"}>{t.status === "OCCUPIED" ? "Ocupada" : "Livre"}</Badge>
        </div>
      )}
      renderForm={(t) => (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Número">
            <Input name="number" type="number" min="1" required defaultValue={t?.number} />
          </Field>
          <Field label="Nome (opcional)">
            <Input name="name" defaultValue={t?.name ?? ""} placeholder="Varanda" />
          </Field>
        </div>
      )}
      save={async (editing, form) => {
        const body = { number: Number(form.get("number")), name: str(form, "name") };
        if (editing) await api(`/tables/${editing.id}`, { method: "PUT", body });
        else await api("/tables", { method: "POST", body });
      }}
      remove={(t) => api(`/tables/${t.id}`, { method: "DELETE" })}
    />
  );
}
