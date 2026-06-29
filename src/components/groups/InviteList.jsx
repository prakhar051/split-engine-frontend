import InviteCard from './InviteCard';
import EmptyState from '../ui/EmptyState';
import { Mail } from 'lucide-react';

export default function InviteList({ invites, onRevoke, isOwner }) {
  if (!invites || invites.length === 0) {
    return (
      <EmptyState
        title="No invitations created"
        message="Active and previous invitations will be listed here."
        icon={Mail}
      />
    );
  }

  return (
    <div className="space-y-4 w-full">
      {invites.map((invite) => (
        <InviteCard
          key={invite.id}
          invite={invite}
          onRevoke={() => onRevoke(invite.id)}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}
