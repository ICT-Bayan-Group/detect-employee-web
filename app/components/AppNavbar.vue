<template>
  <header class="navbar">
    <div class="navbar-inner">
      <!-- Logo -->
      <a href="/" class="navbar-brand">
        <img
          src="https://res.cloudinary.com/djs5pi7ev/image/upload/q_auto/f_auto/v1774509112/BAYAN_R_-_SAMPING_fgnkyb.png"
          alt="Bayan Logo"
          class="navbar-logo"
        />
      </a>

      <!-- Center tag -->
      <div class="navbar-badge">
        <span class="badge-dot"></span>
        Internal Portal
      </div>

      <!-- Right links -->
      <nav class="navbar-links">
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.navbar-inner {
  max-width: 1200px; margin: 0 auto;
  padding: .75rem 1.5rem;
  display: flex; align-items: center; gap: 1rem;
}
.navbar-brand { display: flex; align-items: center; }
.navbar-logo  { height: 36px; width: auto; object-fit: contain; }

.navbar-badge {
  display: flex; align-items: center; gap: .45rem;
  margin-left: .75rem;
  padding: .3rem .75rem;
  border-radius: 999px;
  background: var(--brand-blue-lt);
  color: var(--brand-blue);
  font-size: .72rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
}
.badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--brand-blue);
  animation: pulse-ring 2s ease-in-out infinite;
}

.navbar-links {
  margin-left: auto;
  display: flex; align-items: center; gap: .75rem;
}
.nav-link {
  font-size: .82rem; font-weight: 600;
  color: var(--text-md);
  padding: .4rem .85rem;
  border-radius: var(--radius-sm);
  transition: background .2s, color .2s;
}
.nav-link:hover { background: var(--bg); color: var(--brand-blue); }
.nav-link--admin {
  background: var(--brand-blue-lt);
  color: var(--brand-blue);
}
.nav-link--admin:hover { background: var(--brand-blue); color: #fff; }

@media (max-width: 480px) {
  .navbar-badge { display: none; }
  .nav-link:not(.nav-link--admin) { display: none; }
}
</style>
