"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { errorMessage } from "@/lib/api";
import { Button, ConfirmModal, EmptyState, ErrorState, Loading, Modal, PageHeader, useToast } from "./ui";

interface CrudListProps<T extends { id: string }> {
  title: string;
  subtitle?: string;
  newLabel: string;
  items: T[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
  renderForm: (editing: T | null) => ReactNode;
  save: (editing: T | null, form: FormData) => Promise<void>;
  remove?: (item: T) => Promise<void>;
  itemName: (item: T) => string;
}

// Lista + modal de criar/editar + confirmação de exclusão, compartilhado pelas telas de administração
export function CrudList<T extends { id: string }>({
  title,
  subtitle,
  newLabel,
  items,
  loading,
  error,
  reload,
  emptyText,
  renderItem,
  renderForm,
  save,
  remove,
  itemName,
}: CrudListProps<T>) {
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [removing, setRemoving] = useState(false);

  function openForm(item: T | null) {
    setEditing(item);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await save(editing, new FormData(e.currentTarget));
      toast(editing ? "Alterações salvas" : "Cadastro realizado", "success");
      setFormOpen(false);
      reload();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!deleting || !remove) return;
    setRemoving(true);
    try {
      await remove(deleting);
      toast("Item excluído", "success");
      reload();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setRemoving(false);
      setDeleting(null);
    }
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={<Button onClick={() => openForm(null)}>{newLabel}</Button>} />

      {loading && !items ? (
        <Loading />
      ) : error || !items ? (
        <ErrorState message={error ?? "Erro inesperado"} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState>{emptyText}</EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" onClick={() => openForm(item)}>
                  Editar
                </Button>
                {remove && (
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(item)}>
                    Excluir
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={formOpen} title={editing ? "Editar" : newLabel} onClose={() => setFormOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm(editing)}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={deleting !== null}
        title="Excluir"
        message={deleting ? `Excluir "${itemName(deleting)}"? Esta ação não pode ser desfeita.` : ""}
        confirmLabel="Excluir"
        loading={removing}
        onConfirm={handleRemove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

export function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}
