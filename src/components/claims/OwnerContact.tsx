export function OwnerContact({
  ownerName,
  ownerEmail,
}: {
  ownerName: string | null;
  ownerEmail: string;
}) {
  return (
    <div className="rounded-flyer border-2 border-ink bg-mustard/20 p-3 text-sm text-ink">
      <p className="font-display font-semibold">Owner Contact</p>
      <p>{ownerName ?? "Unnamed user"}</p>
      <p>{ownerEmail}</p>
    </div>
  );
}
