"use client";

import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { Badge, Field, Input, Select, Textarea, useLoad } from "@/components/ui";
import { CrudList, str } from "@/components/CrudList";

export default function ProdutosPage() {
  const { data, loading, error, reload } = useLoad(async () => {
    const [products, categories] = await Promise.all([api<Product[]>("/products"), api<Category[]>("/categories")]);
    return { products, categories };
  });

  const categories = data?.categories ?? [];

  return (
    <CrudList<Product>
      title="Produtos"
      subtitle="Cardápio disponível para os garçons"
      newLabel="Novo produto"
      items={data?.products ?? null}
      loading={loading}
      error={error}
      reload={reload}
      emptyText="Nenhum produto cadastrado."
      itemName={(p) => p.name}
      renderItem={(p) => (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{p.name}</p>
            {!p.active && <Badge tone="red">Inativo</Badge>}
          </div>
          <p className="truncate text-sm text-slate-500">
            {p.category?.name} · {p.description}
          </p>
          <p className="text-sm font-semibold text-emerald-700">{money(p.price)}</p>
        </>
      )}
      renderForm={(p) => (
        <>
          <Field label="Nome">
            <Input name="name" required defaultValue={p?.name} />
          </Field>
          <Field label="Descrição">
            <Textarea name="description" required rows={2} defaultValue={p?.description} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço (R$)">
              <Input name="price" type="number" step="0.01" min="0" required defaultValue={p?.price} />
            </Field>
            <Field label="Categoria">
              <Select name="categoryId" required defaultValue={p?.categoryId ?? ""}>
                <option value="" disabled>
                  Selecione
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {p && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4 accent-emerald-600" />
              Produto ativo
            </label>
          )}
        </>
      )}
      save={async (editing, form) => {
        const body = {
          name: str(form, "name"),
          description: str(form, "description"),
          price: str(form, "price"),
          categoryId: str(form, "categoryId"),
        };
        if (editing) await api(`/products/${editing.id}`, { method: "PUT", body: { ...body, active: form.get("active") === "on" } });
        else await api("/products", { method: "POST", body });
      }}
      remove={(p) => api(`/products/${p.id}`, { method: "DELETE" })}
    />
  );
}
