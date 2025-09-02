import { useAvatarStore } from '../../stores/avatarStore';
import { DEFAULT_AVATARS } from '../../utils/constants';

export function AvatarSelector() {
  const { currentAvatar, setCurrentAvatar, setLoading } = useAvatarStore();

  const handleAvatarChange = async (avatar: any) => {
    setLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentAvatar(avatar);
    } catch (error) {
      console.error('Failed to load avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Choose Avatar</h3>
      <div className="grid grid-cols-1 gap-2">
        {DEFAULT_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => handleAvatarChange(avatar)}
            className={`p-3 rounded-lg border transition-all duration-200 text-left ${
              currentAvatar?.id === avatar.id
                ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-gray-200'
            }`}
          >
            <div className="font-medium text-sm">{avatar.name}</div>
            <div className="text-xs text-gray-400 truncate">{avatar.id}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
