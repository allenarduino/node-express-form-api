import { User } from '../../context/AuthContext';

interface UserAvatarProps {
    user: User | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const getInitials = (user: User) => {
        if (user.profile?.name) {
            return user.profile.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (user.name) {
            return user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return user.email.slice(0, 2).toUpperCase();
    };

    if (user?.profile?.avatarUrl) {
        return (
            <img
                src={user.profile.avatarUrl}
                alt={user.profile.name || user.name || user.email}
                className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-primary-light flex items-center justify-center ${className}`}>
            <span className={`${textSizeClasses[size]} font-medium text-primary-dark`}>
                {user ? getInitials(user) : '?'}
            </span>
        </div>
    );
}
