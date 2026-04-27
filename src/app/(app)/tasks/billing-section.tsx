"use client";

import { useActionState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCents } from "@/lib/money";
import type { TaskBidWithProfile, TaskInvoiceWithProfile } from "@/lib/types";
import {
  createBid,
  createInvoice,
  deleteBid,
  deleteInvoice,
  markInvoicePaid,
  setBidStatus,
  unmarkInvoicePaid,
  type BillingFormState,
} from "./billing-actions";

const initial: BillingFormState = { status: "idle" };

type Props = {
  taskId: string;
  bids: TaskBidWithProfile[];
  invoices: TaskInvoiceWithProfile[];
  role: string | null;
  isAssignedHandyman: boolean;
};

function bidStatusPill(status: string) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-pine/10 px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-brand-pine">
        Accepted
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-brand-sunset-ember/10 px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-brand-sunset-ember">
      Proposed
    </span>
  );
}

function CreatorLabel({ name }: { name: string | null }) {
  return <span className="text-xs text-muted-foreground">{name ?? "Unknown"}</span>;
}

export function BillingSection({
  taskId,
  bids,
  invoices,
  role,
  isAssignedHandyman,
}: Props) {
  const isFamilyOrOwner = role === "owner" || role === "family";

  return (
    <div className="flex flex-col gap-6">
      <BidsBlock
        taskId={taskId}
        bids={bids}
        canSubmit={isAssignedHandyman}
        canDecide={isFamilyOrOwner}
      />
      <InvoicesBlock
        taskId={taskId}
        invoices={invoices}
        canSubmit={isAssignedHandyman}
        canMarkPaid={isFamilyOrOwner}
      />
    </div>
  );
}

function BidsBlock({
  taskId,
  bids,
  canSubmit,
  canDecide,
}: {
  taskId: string;
  bids: TaskBidWithProfile[];
  canSubmit: boolean;
  canDecide: boolean;
}) {
  const submitBid = createBid.bind(null, taskId);
  const [state, formAction, pending] = useActionState(submitBid, initial);

  return (
    <section className="flex flex-col gap-3">
      <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground px-1">
        Bids
      </p>

      {bids.length === 0 ? (
        <div className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">
            {canSubmit ? "No bids yet. Submit one below." : "No bids yet."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {bids.map((bid) => (
            <li
              key={bid.id}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-lg tracking-tight text-foreground">
                      {formatCents(bid.amount_cents)}
                    </p>
                    {bidStatusPill(bid.status)}
                  </div>
                  {bid.notes && (
                    <p className="text-sm text-muted-foreground">{bid.notes}</p>
                  )}
                  <CreatorLabel name={bid.creator?.full_name ?? null} />
                </div>
                {canDecide && bid.status === "proposed" && (
                  <div className="flex gap-1.5">
                    <form
                      action={async () => {
                        await setBidStatus(taskId, bid.id, "accepted");
                      }}
                    >
                      <button
                        type="submit"
                        aria-label="Accept bid"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-pine/10 text-brand-pine hover:bg-brand-pine/20 transition"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                    <form
                      action={async () => {
                        await setBidStatus(taskId, bid.id, "rejected");
                      }}
                    >
                      <button
                        type="submit"
                        aria-label="Reject bid"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}
                {canSubmit && bid.status === "proposed" && (
                  <form
                    action={async () => {
                      await deleteBid(taskId, bid.id);
                    }}
                  >
                    <button
                      type="submit"
                      aria-label="Delete bid"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canSubmit && (
        <form
          action={formAction}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4"
        >
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Submit a bid
          </p>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={`bid-amount-${taskId}`}
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Amount
            </Label>
            <Input
              id={`bid-amount-${taskId}`}
              name="amount"
              type="text"
              inputMode="decimal"
              required
              placeholder="$240"
              className="h-11 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={`bid-notes-${taskId}`}
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Notes
            </Label>
            <textarea
              id={`bid-notes-${taskId}`}
              name="notes"
              rows={2}
              placeholder="Parts and labor."
              className="rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit bid"}
          </Button>
          {state.status === "error" && state.message && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

function InvoicesBlock({
  taskId,
  invoices,
  canSubmit,
  canMarkPaid,
}: {
  taskId: string;
  invoices: TaskInvoiceWithProfile[];
  canSubmit: boolean;
  canMarkPaid: boolean;
}) {
  const submitInvoice = createInvoice.bind(null, taskId);
  const [state, formAction, pending] = useActionState(submitInvoice, initial);

  return (
    <section className="flex flex-col gap-3">
      <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground px-1">
        Invoices
      </p>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-border/80 border-dashed bg-muted/30 px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">
            {canSubmit ? "No invoices yet. Submit one when work is done." : "No invoices yet."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className={`rounded-2xl border bg-card px-4 py-3 ${
                inv.paid_at ? "border-brand-pine/30 bg-brand-pine/5" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-lg tracking-tight text-foreground">
                      {formatCents(inv.amount_cents)}
                    </p>
                    {inv.paid_at ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-pine/10 px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-brand-pine">
                        <Check className="h-2.5 w-2.5" />
                        Paid{inv.payment_method ? ` · ${inv.payment_method}` : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-brand-sunset-ember/10 px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.18em] text-brand-sunset-ember">
                        Outstanding
                      </span>
                    )}
                  </div>
                  {inv.notes && (
                    <p className="text-sm text-muted-foreground">{inv.notes}</p>
                  )}
                  <CreatorLabel name={inv.creator?.full_name ?? null} />
                </div>
              </div>

              {canMarkPaid && !inv.paid_at && (
                <form
                  action={async (fd) => {
                    await markInvoicePaid(taskId, inv.id, fd);
                  }}
                  className="mt-3 flex items-center gap-2"
                >
                  <Input
                    name="payment_method"
                    type="text"
                    placeholder="Check, Venmo, cash…"
                    className="h-9 text-sm flex-1"
                  />
                  <button
                    type="submit"
                    className="flex h-9 items-center justify-center rounded-full bg-brand-pine px-4 text-xs font-medium text-white hover:bg-brand-pine/90 transition whitespace-nowrap"
                  >
                    Mark paid
                  </button>
                </form>
              )}

              {canMarkPaid && inv.paid_at && (
                <form
                  action={async () => {
                    await unmarkInvoicePaid(taskId, inv.id);
                  }}
                  className="mt-2"
                >
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    Mark unpaid
                  </button>
                </form>
              )}

              {canSubmit && !inv.paid_at && (
                <form
                  action={async () => {
                    await deleteInvoice(taskId, inv.id);
                  }}
                  className="mt-2"
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      {canSubmit && (
        <form
          action={formAction}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4"
        >
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Submit an invoice
          </p>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={`inv-amount-${taskId}`}
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Amount
            </Label>
            <Input
              id={`inv-amount-${taskId}`}
              name="amount"
              type="text"
              inputMode="decimal"
              required
              placeholder="$240"
              className="h-11 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={`inv-notes-${taskId}`}
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Notes
            </Label>
            <textarea
              id={`inv-notes-${taskId}`}
              name="notes"
              rows={2}
              placeholder="Done. Receipts in the toolbox."
              className="rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit invoice"}
          </Button>
          {state.status === "error" && state.message && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
