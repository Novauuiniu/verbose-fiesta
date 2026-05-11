import React, { useState, useEffect, useCallback } from 'react';

const STATUS_CONFIG = {
  online: { label: 'Online', color: '#23a55a', icon: 'fa-solid fa-circle' },
  idle: { label: 'Idle', color: '#f0b232', icon: 'fa-solid fa-moon' },
  dnd: { label: 'Do Not Disturb', color: '#f23f43', icon: 'fa-solid fa-minus-circle' },
  offline: { label: 'Offline', color: '#80848e', icon: 'fa-regular fa-circle' },
};

export default function AccountManager({ user }) {
  const [discordUser, setDiscordUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [presence, setPresence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const userId = discordUser?.id || user?.userId;

  const fetchPresence = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${uid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setPresence(data.data);
      }
    } catch {
      // Lanyard unavailable
    }
  }, []);

  useEffect(() => {
    fetchAccountData();
  }, []);

  useEffect(() => {
    if (userId) fetchPresence(userId);
    if (!userId) return;
    const interval = setInterval(() => fetchPresence(userId), 30000);
    return () => clearInterval(interval);
  }, [userId, fetchPresence]);

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
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
    : user?.avatar
      ? `https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const bannerUrl = discordUser?.banner
    ? `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.${discordUser.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`
    : null;

  const bannerColor = discordUser?.banner_color || '#5865F2';

  const displayUser = discordUser || {
    username: user?.username || 'Unknown',
    id: user?.userId || '—',
    global_name: user?.global_name || user?.username || 'Unknown'
  };

  const bio = discordUser?.bio || presence?.discord_user?.bio || null;

  const discordStatus = presence?.discord_status || 'offline';
  const statusInfo = STATUS_CONFIG[discordStatus] || STATUS_CONFIG.offline;

  const customStatus = presence?.activities?.find(a => a.type === 4);
  const currentActivity = presence?.activities?.find(a => a.type !== 4 && a.type !== 2);

  const spotifyData = presence?.spotify || null;

  const createdAt = displayUser.id && displayUser.id !== '—'
    ? new Date(Number(BigInt(displayUser.id) >> 22n) + 1420070400000)
    : null;

  const sessionExpiry = user?.exp ? new Date(user.exp * 1000) : null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'fa-solid fa-user' },
    { id: 'activity', label: 'Activity', icon: 'fa-solid fa-gamepad' },
    { id: 'servers', label: 'Servers', icon: 'fa-solid fa-server' },
    { id: 'session', label: 'Session', icon: 'fa-solid fa-key' },
    { id: 'preferences', label: 'Preferences', icon: 'fa-solid fa-sliders' }
  ];

  return (
    <div className="account-manager animate-fade-in">
      <div className="settings-page-header">
        <div className="settings-page-header-text">
          <h2 className="glow-text"><i className="fa-solid fa-user-gear"></i> User Settings</h2>
          <p className="subtitle">Manage your Discord profile, activity, servers, session, and preferences.</p>
        </div>
        <button className="btn-secondary settings-refresh-btn" onClick={() => { fetchAccountData(); if (userId) fetchPresence(userId); }}>
          <i className="fa-solid fa-rotate-right"></i> Refresh
        </button>
      </div>

      <div className="settings-tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading && <div className="loader">Loading account data...</div>}
      {error && !loading && (
        <div className="glass-panel settings-error-banner">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
          <button className="btn-secondary" onClick={fetchAccountData}>Retry</button>
        </div>
      )}

      {/* ═══ Profile Tab ═══ */}
      {!loading && activeTab === 'profile' && (
        <div className="settings-section animate-fade-in">
          {/* Profile Card with Banner */}
          <div className="glass-panel settings-profile-card">
            <div
              className="settings-profile-banner"
              style={bannerUrl
                ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: `linear-gradient(135deg, ${bannerColor}, ${bannerColor}88)` }
              }
            >
              <div className="settings-profile-banner-overlay" />
            </div>
            <div className="settings-profile-body">
              <div className="settings-profile-avatar-wrapper">
                <img className="settings-profile-avatar" src={avatarUrl} alt="Avatar" />
                <div
                  className="settings-profile-status-dot"
                  style={{ background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }}
                  title={statusInfo.label}
                />
              </div>
              <div className="settings-profile-main-info">
                <h2 className="settings-profile-display-name">{displayUser.global_name || displayUser.username}</h2>
                <p className="settings-profile-username">@{displayUser.username}</p>
                {displayUser.discriminator && displayUser.discriminator !== '0' && (
                  <p className="settings-profile-discriminator">#{displayUser.discriminator}</p>
                )}
                <div className="settings-profile-status-line">
                  <i className={statusInfo.icon} style={{ color: statusInfo.color, fontSize: '0.6rem' }}></i>
                  <span style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                  {customStatus && (
                    <span className="settings-custom-status">
                      {customStatus.emoji?.name && <span>{customStatus.emoji.name} </span>}
                      {customStatus.state}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio / About Me */}
          {bio && (
            <div className="glass-panel settings-bio-card">
              <h3><i className="fa-solid fa-quote-left"></i> About Me</h3>
              <div className="settings-bio-content">
                {bio.split('\n').map((line, i) => (
                  <p key={i}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="settings-details-grid">
            <div className="glass-panel settings-detail-card">
              <div className="settings-detail-icon">
                <i className="fa-solid fa-id-badge"></i>
              </div>
              <div className="settings-detail-content">
                <span className="settings-detail-label">User ID</span>
                <span className="settings-detail-value">{displayUser.id}</span>
              </div>
            </div>

            {createdAt && (
              <div className="glass-panel settings-detail-card">
                <div className="settings-detail-icon">
                  <i className="fa-solid fa-calendar"></i>
                </div>
                <div className="settings-detail-content">
                  <span className="settings-detail-label">Account Created</span>
                  <span className="settings-detail-value">{createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            )}

            <div className="glass-panel settings-detail-card">
              <div className="settings-detail-icon" style={{ background: `${statusInfo.color}22`, color: statusInfo.color }}>
                <i className={statusInfo.icon}></i>
              </div>
              <div className="settings-detail-content">
                <span className="settings-detail-label">Current Status</span>
                <span className="settings-detail-value" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
              </div>
            </div>

            {discordUser?.locale && (
              <div className="glass-panel settings-detail-card">
                <div className="settings-detail-icon">
                  <i className="fa-solid fa-globe"></i>
                </div>
                <div className="settings-detail-content">
                  <span className="settings-detail-label">Locale</span>
                  <span className="settings-detail-value">{discordUser.locale}</span>
                </div>
              </div>
            )}

            {discordUser?.mfa_enabled !== undefined && (
              <div className="glass-panel settings-detail-card">
                <div className="settings-detail-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div className="settings-detail-content">
                  <span className="settings-detail-label">Two-Factor Authentication</span>
                  <span className="settings-detail-value">
                    {discordUser.mfa_enabled
                      ? <span style={{ color: 'var(--success)' }}><i className="fa-solid fa-check-circle"></i> Enabled</span>
                      : <span style={{ color: 'var(--danger)' }}><i className="fa-solid fa-xmark-circle"></i> Disabled</span>
                    }
                  </span>
                </div>
              </div>
            )}

            {discordUser?.premium_type !== undefined && (
              <div className="glass-panel settings-detail-card">
                <div className="settings-detail-icon" style={{ color: '#f47fff', background: 'rgba(244, 127, 255, 0.1)' }}>
                  <i className="fa-solid fa-gem"></i>
                </div>
                <div className="settings-detail-content">
                  <span className="settings-detail-label">Nitro Subscription</span>
                  <span className="settings-detail-value">
                    {discordUser.premium_type === 0 && 'None'}
                    {discordUser.premium_type === 1 && 'Nitro Classic'}
                    {discordUser.premium_type === 2 && 'Nitro'}
                    {discordUser.premium_type === 3 && 'Nitro Basic'}
                  </span>
                </div>
              </div>
            )}

            {discordUser?.accent_color != null && (
              <div className="glass-panel settings-detail-card">
                <div className="settings-detail-icon" style={{ background: `#${discordUser.accent_color.toString(16).padStart(6, '0')}33`, color: `#${discordUser.accent_color.toString(16).padStart(6, '0')}` }}>
                  <i className="fa-solid fa-palette"></i>
                </div>
                <div className="settings-detail-content">
                  <span className="settings-detail-label">Accent Color</span>
                  <span className="settings-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="settings-color-swatch" style={{ background: `#${discordUser.accent_color.toString(16).padStart(6, '0')}` }}></span>
                    #{discordUser.accent_color.toString(16).padStart(6, '0').toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Badges */}
          {discordUser?.flags !== undefined && (
            <div className="glass-panel settings-badges-card">
              <h3><i className="fa-solid fa-award"></i> Discord Badges</h3>
              <div className="settings-badge-list">
                {renderBadges(discordUser.public_flags || discordUser.flags)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Activity Tab ═══ */}
      {!loading && activeTab === 'activity' && (
        <div className="settings-section animate-fade-in">
          {/* Current Status */}
          <div className="glass-panel settings-activity-status-card">
            <div className="settings-activity-status-header">
              <i className={statusInfo.icon} style={{ color: statusInfo.color, fontSize: '1.2rem' }}></i>
              <div>
                <h3>Discord Status</h3>
                <span style={{ color: statusInfo.color, fontWeight: 600 }}>{statusInfo.label}</span>
              </div>
            </div>
            {customStatus && (
              <div className="settings-activity-custom-status">
                {customStatus.emoji?.id ? (
                  <img
                    src={`https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? 'gif' : 'png'}?size=24`}
                    alt=""
                    className="settings-activity-emoji"
                  />
                ) : customStatus.emoji?.name ? (
                  <span className="settings-activity-emoji-text">{customStatus.emoji.name}</span>
                ) : null}
                <span>{customStatus.state || 'No custom status message'}</span>
              </div>
            )}
            {!customStatus && (
              <p className="settings-activity-no-data">No custom status set.</p>
            )}
          </div>

          {/* Spotify */}
          {spotifyData && (
            <div className="glass-panel settings-spotify-card">
              <div className="settings-spotify-header">
                <i className="fa-brands fa-spotify" style={{ color: '#1DB954', fontSize: '1.4rem' }}></i>
                <span>Listening on Spotify</span>
              </div>
              <div className="settings-spotify-body">
                {spotifyData.album_art_url && (
                  <img src={spotifyData.album_art_url} alt="Album Art" className="settings-spotify-art" />
                )}
                <div className="settings-spotify-info">
                  <h4>{spotifyData.song}</h4>
                  <p className="settings-spotify-artist">by {spotifyData.artist}</p>
                  <p className="settings-spotify-album">on {spotifyData.album}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Activity / Game */}
          {currentActivity && (
            <div className="glass-panel settings-activity-game-card">
              <h3>
                <i className="fa-solid fa-gamepad"></i>
                {currentActivity.type === 0 && ' Playing'}
                {currentActivity.type === 1 && ' Streaming'}
                {currentActivity.type === 2 && ' Listening to'}
                {currentActivity.type === 3 && ' Watching'}
                {currentActivity.type === 5 && ' Competing in'}
              </h3>
              <div className="settings-activity-game-body">
                {currentActivity.assets?.large_image && (
                  <img
                    src={currentActivity.assets.large_image.startsWith('mp:')
                      ? `https://media.discordapp.net/${currentActivity.assets.large_image.replace('mp:', '')}`
                      : `https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${currentActivity.assets.large_image}.png`
                    }
                    alt=""
                    className="settings-activity-game-art"
                  />
                )}
                <div className="settings-activity-game-info">
                  <h4>{currentActivity.name}</h4>
                  {currentActivity.details && <p>{currentActivity.details}</p>}
                  {currentActivity.state && <p className="settings-activity-game-state">{currentActivity.state}</p>}
                </div>
              </div>
            </div>
          )}

          {!customStatus && !spotifyData && !currentActivity && (
            <div className="glass-panel settings-empty-state">
              <i className="fa-solid fa-gamepad" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
              <p>No current activity detected. Activity data is fetched via Lanyard in real-time.</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Make sure the user is in the <a href="https://discord.gg/lanyard" target="_blank" rel="noreferrer" style={{ color: 'var(--premium-pink)' }}>Lanyard Discord server</a> for presence tracking.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Servers Tab ═══ */}
      {!loading && activeTab === 'servers' && (
        <div className="settings-section animate-fade-in">
          <div className="settings-section-intro glass-panel">
            <i className="fa-solid fa-server" style={{ fontSize: '1.2rem', color: 'var(--premium-pink)' }}></i>
            <div>
              <h3>Linked Servers</h3>
              <p>Servers you have access to through your Discord account.</p>
            </div>
          </div>
          {(guilds.length > 0 ? guilds : user?.allowedGuilds || []).length > 0 ? (
            <div className="settings-servers-grid">
              {(guilds.length > 0 ? guilds : user?.allowedGuilds || []).map(g => (
                <div key={g.id} className="glass-panel settings-server-card">
                  <div className="settings-server-icon-wrap">
                    {g.icon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`}
                        alt={g.name}
                        className="settings-server-icon"
                      />
                    ) : (
                      <div className="settings-server-placeholder">
                        {g.name?.charAt(0) || '#'}
                      </div>
                    )}
                  </div>
                  <div className="settings-server-info">
                    <h4>{g.name}</h4>
                    <span className="settings-server-id">{g.id}</span>
                    <div className="settings-server-badges">
                      {g.owner && <span className="badge">Owner</span>}
                      {g.permissions && (
                        <span className="badge" style={{ background: 'rgba(99, 179, 255, 0.15)', color: '#63b3ff' }}>
                          {(BigInt(g.permissions) & 0x8n) !== 0n ? 'Admin' : 'Member'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel settings-empty-state">
              <i className="fa-solid fa-server" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
              <p>No servers available. Server data is loaded from the API when available.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Session Tab ═══ */}
      {!loading && activeTab === 'session' && (
        <div className="settings-section animate-fade-in">
          <div className="glass-panel settings-session-card">
            <div className="settings-session-header">
              <h3><i className="fa-solid fa-shield-halved"></i> Session Information</h3>
              <div className="settings-session-status">
                <span className="settings-status-dot active"></span>
                Active
              </div>
            </div>
            <div className="settings-session-grid">
              {sessionExpiry && (
                <div className="settings-session-item">
                  <i className="fa-solid fa-clock"></i>
                  <div>
                    <span className="settings-detail-label">Session Expires</span>
                    <span className="settings-detail-value">{sessionExpiry.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="settings-session-item">
                <i className="fa-solid fa-server"></i>
                <div>
                  <span className="settings-detail-label">Allowed Servers</span>
                  <span className="settings-detail-value">{user?.allowedGuilds?.length || 0}</span>
                </div>
              </div>
              <div className="settings-session-item">
                <i className="fa-brands fa-discord"></i>
                <div>
                  <span className="settings-detail-label">Authentication Method</span>
                  <span className="settings-detail-value">Discord OAuth2</span>
                </div>
              </div>
            </div>
            <div className="settings-session-actions">
              <button className="btn-primary" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
              <button className="btn-secondary" onClick={fetchAccountData}>
                <i className="fa-solid fa-rotate-right"></i> Refresh Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Preferences Tab ═══ */}
      {!loading && activeTab === 'preferences' && (
        <div className="settings-section animate-fade-in">
          <div className="glass-panel settings-prefs-card">
            <h3><i className="fa-solid fa-sliders"></i> User Preferences</h3>
            <p className="subtitle" style={{ marginBottom: '24px' }}>Customize your dashboard experience.</p>
            
            <div className="settings-pref-group">
              <div className="settings-pref-item">
                <div className="settings-pref-info">
                  <h4>Compact Mode</h4>
                  <p>Use a more compact layout with smaller spacing.</p>
                </div>
                <label className="settings-toggle">
                  <input type="checkbox" disabled />
                  <span className="settings-toggle-slider"></span>
                </label>
              </div>

              <div className="settings-pref-item">
                <div className="settings-pref-info">
                  <h4>Notification Sounds</h4>
                  <p>Play a sound when receiving new moderation alerts.</p>
                </div>
                <label className="settings-toggle">
                  <input type="checkbox" disabled />
                  <span className="settings-toggle-slider"></span>
                </label>
              </div>

              <div className="settings-pref-item">
                <div className="settings-pref-info">
                  <h4>Auto-Refresh Dashboard</h4>
                  <p>Automatically refresh analytics data every 30 seconds.</p>
                </div>
                <label className="settings-toggle">
                  <input type="checkbox" disabled />
                  <span className="settings-toggle-slider"></span>
                </label>
              </div>

              <div className="settings-pref-item">
                <div className="settings-pref-info">
                  <h4>Show Server Member Count</h4>
                  <p>Display member count alongside server names.</p>
                </div>
                <label className="settings-toggle">
                  <input type="checkbox" disabled />
                  <span className="settings-toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-pref-coming-soon">
              <i className="fa-solid fa-flask"></i>
              <span>Preferences are coming soon. These settings are preview-only.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderBadges(flags) {
  if (!flags) return <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No badges found.</p>;
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
  if (userBadges.length === 0) return <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No badges found.</p>;

  return (
    <>
      {userBadges.map(b => (
        <span key={b.flag} className="settings-badge-chip" title={b.name}>
          <i className={b.icon}></i> {b.name}
        </span>
      ))}
    </>
  );
}
