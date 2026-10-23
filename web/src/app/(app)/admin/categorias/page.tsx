"use client";

import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Field, Input, useLoad } from "@/components/ui";
import { CrudList, str } from "@/components/CrudList";

export default function CategoriasPage() {
  const { data, loading, error, reload } = useLoad(() => api<Category[]>("/categories"));

  return (
    <CrudList<Category>
      title="Categorias"
      subtitle="Agrupam os produtos do cardápio"
      newLabel="Nova categoria"
      items={data}
      loading={loading}
      error={error}
      reload={reload}
      emptyText="Nenhuma categoria cadastrada."
      itemName={(c) => c.name}
      renderItem={(c) => <p className="font-medium">{c.name}</p>}
      renderForm={(c) => (
        <Field label="Nome">
          <Input name="name" required defaultValue={c?.name} autoFocus />
        </Field>
      )}
      save={async (editing, form) => {
        const body = { name: str(form, "name") };
        if (editing) await api(`/categories/${editing.id}`, { method: "PUT", body });
        else await api("/categories", { method: "POST", body });
      }}
      remove={(c) => api(`/categories/${c.id}`, { method: "DELETE" })}
    />
  );
}
