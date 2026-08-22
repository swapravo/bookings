import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { store } from '@/lib/store';
import { useCurrentUser } from '@/lib/useStore';

export function ProfilePage() {
  const user = useCurrentUser();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [saved, setSaved] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

  const handleSave = async () => {
    setUsernameError('');
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (cleanUsername !== user.username) {
        if (cleanUsername.length < 3) {
          setUsernameError('Username must be at least 3 characters.');
          setSaving(false);
          return;
        }
        const available = await store.isUsernameAvailable(cleanUsername, user.id);
        if (!available) {
          setUsernameError('That username is taken.');
          setSaving(false);
          return;
        }
        await store.setUsername(user.id, cleanUsername);
      }

      await store.updateProfile(user.id, { name: name.trim(), bio: bio.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setUsernameError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-serif text-ink mb-1">Profile</h1>
        <p className="text-ink-secondary">Update your personal information and public page.</p>
      </div>

      <div className="card-surface p-6 md:p-8 animate-fade-in">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={name || 'User'} src={user.avatarUrl} size="xl" />
          <div>
            <p className="text-sm text-ink-secondary mb-1">Profile picture</p>
            <p className="text-xs text-ink-tertiary">Avatar is generated from your name.</p>
          </div>
        </div>

        <div className="space-y-5">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={saving}
          />

          <div>
            <Input
              label="Username"
              value={cleanUsername}
              onChange={(e) => setUsername(e.target.value)}
              prefixNode={<span className="text-ink-tertiary">booktime.app/</span>}
              className="pl-28"
              error={usernameError}
              disabled={saving}
            />
          </div>

          <Textarea
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio shown on your public page."
            rows={3}
            disabled={saving}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <div className="rounded-btn border border-border bg-background px-4 py-3 text-sm text-ink-secondary">
              {user.email}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
          </Button>
          <Link to={`/${cleanUsername || user.username}`}>
            <Button variant="outline">
              View my page <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
