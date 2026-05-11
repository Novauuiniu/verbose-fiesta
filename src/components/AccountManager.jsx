import React, { useState, useEffect } from 'react';

export default function AccountManager({ user }) {
  const [discordUser, setDiscordUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('zenith_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, guildsRes] = await Promise.allSettled([
        fetch('/api/account/profile', { headers }),
        fetch('/api/account/guilds', { headers })
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        setDiscordUser(await profileRes.value.json());
      }

      if (guildsRes.status === 'fulfilled' && guildsRes.value.ok) {
        setGuilds(await guildsRes.value.json());
      }
    } catch (err) {
      setError('Failed to fetch account data');
      console.error('[AccountManager]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zenith_token');
    localStorage.removeItem('zenith_guild_id');
    window.location.href = '/login';
  };

  const avatarUrl = discordUser?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
    : user?.avatar
      ? `https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png?size=256`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const bannerColor = discordUser?.banner_color || '#5865F2';

  const displayUser = discordUser || {
    username: user?.username || 'Unknown',
    id: user?.userId || '—',
    global_name: user?.global_name || user?.username || 'Unknown'
  };

  const createdAt = displayUser.id && displayUser.id !== '—'
    ? new Date(Number(BigInt(displayUser.id) >> 22n) + 1420070400000)
    : null;

  const sessionExpiry = user?.exp ? new Date(user.exp * 1000) : null;

  return (
    <div className="account-manager animate-fade-in">
      <div className="section-header">
        <h2 className="glow-text"><i className="fa-solid fa-user-gear"></i> Account Manager</h2>
        <p className="subtitle">View your Discord profile and manage your session.</p>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fa-solid fa-user"></i> Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'servers' ? 'active' : ''}`}
          onClick={() => setActiveTab('servers')}
        >
          <i className="fa-solid fa-server"></i> Servers
        </button>
        <button
          className={`tab-btn ${activeTab === 'session' ? 'active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          <i className="fa-solid fa-key"></i> Session
        </button>
      </div>

      {loading && <div className="loader">Loading account data...</div>}
      {error && !loading && (
        <div className="glass-panel account-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
          <button className="btn-secondary" onClick={fetchAccountData}>Retry</button>
        </div>
      )}

      {!loading && activeTab === 'profile' && (
        <div className="account-profile-section">
          <div className="glass-panel account-card">
            <div className="account-banner" style={{ background: `linear-gradient(135deg, ${bannerColor}, ${bannerColor}88)` }}>
              <img className="account-avatar" src={avatarUrl} alt="Avatar" />
            </div>
            <div className="account-info">
              <h2 className="account-display-name">{displayUser.global_name || displayUser.username}</h2>
              <p className="account-username">@{displayUser.username}</p>
              {displayUser.discriminator && displayUser.discriminator !== '0' && (
                <p className="account-discriminator">#{displayUser.discriminator}</p>
              )}

              <div className="account-details-grid">
                <div className="account-detail">
                  <span className="account-detail-label">User ID</span>
                  <span className="account-detail-value">{displayUser.id}</span>
                </div>
                {createdAt && (
                  <div className="account-detail">
                    <span className="account-detail-label">Account Created</span>
                    <span className="account-detail-value">{createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {discordUser?.locale && (
                  <div className="account-detail">
                    <span className="account-detail-label">Locale</span>
                    <span className="account-detail-value">{discordUser.locale}</span>
                  </div>
                )}
                {discordUser?.mfa_enabled !== undefined && (
                  <div className="account-detail">
                    <span className="account-detail-label">2FA Enabled</span>
                    <span className="account-detail-value">
                      {discordUser.mfa_enabled
                        ? <span style={{ color: 'var(--success)' }}><i className="fa-solid fa-check-circle"></i> Yes</span>
                        : <span style={{ color: 'var(--danger)' }}><i className="fa-solid fa-xmark-circle"></i> No</span>
                      }
                    </span>
                  </div>
                )}
                {discordUser?.premium_type !== undefined && (
                  <div className="account-detail">
                    <span className="account-detail-label">Nitro</span>
                    <span className="account-detail-value">
                      {discordUser.premium_type === 0 && 'None'}
                      {discordUser.premium_type === 1 && 'Nitro Classic'}
                      {discordUser.premium_type === 2 && 'Nitro'}
                      {discordUser.premium_type === 3 && 'Nitro Basic'}
                    </span>
                  </div>
                )}
              </div>

              {discordUser?.flags !== undefined && (
                <div className="account-badges">
                  {renderBadges(discordUser.public_flags || discordUser.flags)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'servers' && (
        <div className="account-servers-section">
          {(guilds.length > 0 ? guilds : user?.allowedGuilds || []).length > 0 ? (
            <div className="account-servers-grid">
              {(guilds.length > 0 ? guilds : user?.allowedGuilds || []).map(g => (
                <div key={g.id} className="glass-panel account-server-card">
                  <div className="account-server-icon-wrap">
                    {g.icon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`}
                        alt={g.name}
                        className="account-server-icon"
                      />
                    ) : (
                      <div className="account-server-placeholder">
                        {g.name?.charAt(0) || '#'}
                      </div>
                    )}
                  </div>
                  <div className="account-server-info">
                    <h4>{g.name}</h4>
                    <span className="account-server-id">{g.id}</span>
                    {g.owner && <span className="badge" style={{ marginTop: '4px' }}>Owner</span>}
                    {g.permissions && (
                      <span className="account-server-perms">
                        {(BigInt(g.permissions) & 0x8n) !== 0n ? 'Admin' : 'Member'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel no-results">
              <p>No servers available. Server data is loaded from the API when available.</p>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'session' && (
        <div className="account-session-section">
          <div className="glass-panel account-session-card">
            <h3><i className="fa-solid fa-shield-halved"></i> Session Information</h3>
            <div className="account-details-grid">
              <div className="account-detail">
                <span className="account-detail-label">Status</span>
                <span className="account-detail-value" style={{ color: 'var(--success)' }}>
                  <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', verticalAlign: 'middle', marginRight: '6px' }}></i>
                  Active
                </span>
              </div>
              {sessionExpiry && (
                <div className="account-detail">
                  <span className="account-detail-label">Expires</span>
                  <span className="account-detail-value">{sessionExpiry.toLocaleString()}</span>
                </div>
              )}
              <div className="account-detail">
                <span className="account-detail-label">Allowed Servers</span>
                <span className="account-detail-value">{user?.allowedGuilds?.length || 0}</span>
              </div>
              <div className="account-detail">
                <span className="account-detail-label">Auth Method</span>
                <span className="account-detail-value">Discord OAuth2</span>
              </div>
            </div>
            <div className="account-session-actions" style={{ marginTop: '24px' }}>
              <button className="btn-primary" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
              <button className="btn-secondary" onClick={fetchAccountData}>
                <i className="fa-solid fa-rotate-right"></i> Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderBadges(flags) {
  if (!flags) return null;
  const BADGES = [
    { flag: 1 << 0, name: 'Discord Employee', icon: 'fa-solid fa-briefcase' },
    { flag: 1 << 1, name: 'Partnered Server Owner', icon: 'fa-solid fa-handshake' },
    { flag: 1 << 2, name: 'HypeSquad Events', icon: 'fa-solid fa-calendar-star' },
    { flag: 1 << 3, name: 'Bug Hunter Level 1', icon: 'fa-solid fa-bug' },
    { flag: 1 << 6, name: 'HypeSquad Bravery', icon: 'fa-solid fa-shield' },
    { flag: 1 << 7, name: 'HypeSquad Brilliance', icon: 'fa-solid fa-gem' },
    { flag: 1 << 8, name: 'HypeSquad Balance', icon: 'fa-solid fa-scale-balanced' },
    { flag: 1 << 9, name: 'Early Supporter', icon: 'fa-solid fa-heart' },
    { flag: 1 << 14, name: 'Bug Hunter Level 2', icon: 'fa-solid fa-bug-slash' },
    { flag: 1 << 17, name: 'Verified Bot Developer', icon: 'fa-solid fa-robot' },
    { flag: 1 << 18, name: 'Certified Moderator', icon: 'fa-solid fa-certificate' },
    { flag: 1 << 22, name: 'Active Developer', icon: 'fa-solid fa-code' },
  ];

  const userBadges = BADGES.filter(b => (flags & b.flag) !== 0);
  if (userBadges.length === 0) return null;

  return (
    <div className="account-badge-list">
      {userBadges.map(b => (
        <span key={b.flag} className="account-badge-chip" title={b.name}>
          <i className={b.icon}></i> {b.name}
        </span>
      ))}
    </div>
  );
}
