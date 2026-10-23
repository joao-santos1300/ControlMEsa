"use client";

import { api } from "@/lib/api";
import { roleLabel } from "@/lib/format";
import type { Role, User } from "@/lib/types";
import { Badge, Field, Input, Select, useLoad } from "@/components/ui";
import { CrudList, str } from "@/components/CrudList";

export default function UsuariosPage() {
  const { data, loading, error, reload } = useLoad(() => api<User[]>("/users"));

  return (
    <CrudList<User>
      title="Usuários"
      subtitle="Equipe com acesso ao sistema"
      newLabel="Novo usuário"
      items={data}
      loading={loading}
      error={error}
      reload={reload}
      emptyText="Nenhum usuário cadastrado."
      itemName={(u) => u.name}
      renderItem={(u) => (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{u.name}</p>
            <Badge tone="blue">{roleLabel[u.role]}</Badge>
            {!u.active && <Badge tone="red">Inativo</Badge>}
          </div>
          <p className="truncate text-sm text-slate-500">{u.email}</p>
        </>
      )}
      renderForm={(u) => (
        <>
          <Field label="Nome">
            <Input name="name" required defaultValue={u?.name} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required defaultValue={u?.email} />
          </Field>
          <Field label={u ? "Nova senha (deixe em branco para manter)" : "Senha"}>
            <Input name="password" type="password" minLength={6} required={!u} autoComplete="new-password" />
          </Field>
          <Field label="Perfil">
            <Select name="role" required defaultValue={u?.role ?? "WAITER"}>
              {(Object.keys(roleLabel) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r]}
                </option>
              ))}
            </Select>
          </Field>
          {u && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={u.active} className="h-4 w-4 accent-emerald-600" />
              Usuário ativo
            </label>
          )}
        </>
      )}
      save={async (editing, form) => {
        const password = String(form.get("password") ?? "");
        const body = { name: str(form, "name"), email: str(form, "email"), role: str(form, "role"), ...(password ? { password } : {}) };
        if (editing) await api(`/users/${editing.id}`, { method: "PUT", body: { ...body, active: form.get("active") === "on" } });
        else await api("/users", { method: "POST", body: { ...body, password } });
      }}
      remove={(u) => api(`/users/${u.id}`, { method: "DELETE" })}
    />
  );
}
